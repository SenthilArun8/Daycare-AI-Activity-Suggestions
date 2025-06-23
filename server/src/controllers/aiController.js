// server/src/controllers/aiController.js
import { getAiInstance } from '../config/googleAuth.js';

const model = 'gemini-2.0-flash-001';

// Add a list of allowed skill names for the LLM to use
const allowedSkills = [
  'Social-Emotional Skills',
  'Cognitive Skills',
  'Literacy Skills',
  'Physical Skills',
  'Creative Arts/Expression Skills',
  'Language and Communication Skills',
  'Self-Help/Adaptive Skills',
  'Problem-Solving Skills',
  'Sensory Processing Skills'
];

// Update the activityPrompt to require each skill in 'Skills supported' to be an object with 'name' and 'category'.
const activityPrompt = `Objective and Persona:You are an expert in early childhood development, specializing in creating engaging and developmentally appropriate activities for toddlers. Your task is to provide diverse activity suggestions tailored to a toddler's individual needs and recent performance.Instructions:To complete the task, you need to follow these steps:Analyze the recent_activity result.If the toddler failed the activity:Provide 5 diverse activity options that help build towards success in the same skill area.Prioritize observations from the recent_activity when suggesting new activities.Also consider developmental_stage, goals, interests, energy_level, and social_behavior.If the toddler succeeded in the activity:Provide 5 diverse activity options to help them grow and develop necessary skills further.Consider their developmental_stage, goals, interests, energy_level, and social_behavior.Ensure all activity suggestions are diverse in nature (e.g., varying types of play, skill focus, materials).For each activity, provide only the following three details:Title of Activity (String)Why it works (String)Skills supported (Array of Objects)Constraints:For the 'Skills supported' array, ONLY use objects of the form { "name": "Skill Name", "category": "One of: ${allowedSkills.join(', ')}" }. The 'name' can be a unique skill (e.g., 'Empathy', 'Counting', 'Jumping'), but the 'category' must be one of the following: ${allowedSkills.map(s => `'${s}'`).join(', ')}. Do not invent new categories. Do not use any other text or explanations outside of the JSON output.Output Format:{ "activity_suggestions": [  {   "Title of Activity": "String",   "Why it works": "String",   "Skills supported": [{"name": "String", "category": "String"}]  } ]}`

const generationConfig = {
    maxOutputTokens: 8192,
    temperature: 1,
    topP: 1,
    safetySettings: [
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'OFF' },
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'OFF' }
    ]
};

export const generateAiActivity = async (req, res) => {
    // Get discarded activity titles from request body (array of objects or strings)
    const discardedActivities = req.body.discardedActivities || [];
    let discardedTitles = [];
    if (Array.isArray(discardedActivities)) {
        discardedTitles = discardedActivities.map(a =>
            typeof a === 'string' ? a : (a['Title of Activity'] || a.title || a.name || '')
        ).filter(Boolean);
    }
    let otherThanText = '';
    // Only add 'Other than' if the prompt does NOT already mention the previous activities
    if (discardedTitles.length > 0 && (!req.body.prompt || !discardedTitles.every(title => req.body.prompt.includes(title)))) {
        otherThanText = ` Other than: ${discardedTitles.join(', ')}.`;
    }
    const userInput = req.body.prompt + otherThanText + " " + activityPrompt;
    console.log('User input for AI:', userInput);

    if (!userInput) {
        return res.status(400).json({ error: 'Prompt is missing from the request body.' });
    }

    try {
        const googleAuthClient = req.app.get('googleAuthClient'); // Retrieve client from app locals
        if (!googleAuthClient) {
            return res.status(500).json({ error: 'Google AI client not initialized.' });
        }
        const ai = getAiInstance(googleAuthClient); // Get the AI instance using the client

        const chat = ai.chats.create({ model, config: generationConfig });
        const stream = await chat.sendMessageStream({ message: { text: userInput } });

        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk.text) fullResponse += chunk.text;
        }

        console.log('Response from AI:', fullResponse);
        try {
            const cleaned = fullResponse.replace(/```json|```/gi, '').trim();
            const parsed = JSON.parse(cleaned);
            res.json({ response: parsed });
        } catch (e) {
            console.error('JSON parse error from AI:', e.message, '\nRaw response:', fullResponse);
            return res.status(500).json({ error: 'Model did not return valid JSON.' });
        }
    } catch (err) {
        console.error('Error during AI generation:', err);
        res.status(500).json({ error: 'Something went wrong during AI generation.' });
    }
};

// Story generation prompt template
const storyPromptTemplate = (student, context) => `
You are an expert children's story writer specializing in creating engaging, age-appropriate stories for young children.

Create a personalized story based on the following details:

Child's Name: ${student.name}
Age: ${student.age_months} months
Context/Scenario: ${context}

Story Requirements:
1. The story should be engaging and appropriate for a the parents of the child.
2. Incorporate the provided context as the main theme of the story.
3. Keep the story positive, educational, and fun.
4. The story should be between 100-200 words.
5. Include a clear beginning, middle, and end.
6. Be creative in your story but do not digress from the main context too much
7. The purpose of this story is to create a post for the parent for the child to view about what activity their child had done that day in a creative, engaging, and professional manner. 
8. DO NOT create characters and stay as true to the facts as possible

Format the response as a JSON object with the following structure:
{
  "title": "The Title of the Story",
  "content": "The full story content here..."
}
`;

export const generateStory = async (req, res) => {
    const { studentName, age, context,} = req.body;

    if (!studentName || !age || !context) {
        return res.status(400).json({ 
            error: 'Missing required fields: studentName, age, and context are required.' 
        });
    }

    try {
        const googleAuthClient = req.app.get('googleAuthClient');
        if (!googleAuthClient) {
            return res.status(500).json({ error: 'Google AI client not initialized.' });
        }
        
        const ai = getAiInstance(googleAuthClient);
        const prompt = storyPromptTemplate(
            { name: studentName, age_months: age },
            context
        );

        console.log('Generating story with prompt:', prompt);
        
        const chat = ai.chats.create({ 
            model: 'gemini-2.0-flash-001',
            config: {
                ...generationConfig,
                temperature: 0.8, // Slightly more creative for stories
                topP: 0.9
            } 
        });
        
        const stream = await chat.sendMessageStream({ message: { text: prompt } });

        let fullResponse = '';
        for await (const chunk of stream) {
            if (chunk.text) fullResponse += chunk.text;
        }

        console.log('Raw story response from AI:', fullResponse);
        
        try {
            // Remove all code block markers and trim whitespace
            const cleaned = fullResponse.replace(/```json|```/gi, '').replace(/^[\s\n]+|[\s\n]+$/g, '');
            // Extract only the first {...} block if present
            const match = cleaned.match(/{[\s\S]*}/);
            const jsonString = match ? match[0] : cleaned;
            const parsed = JSON.parse(jsonString);

            if (!parsed.title || !parsed.content) {
                throw new Error('Invalid story format from AI');
            }

            res.json({
                story: {
                    title: parsed.title,
                    content: parsed.content,
                    generatedAt: new Date().toISOString(),
                    context: context,
                    studentName: studentName
                }
            });
        } catch (e) {
            // Fallback: Try to extract title/content manually if JSON.parse fails
            let fallbackTitle = '';
            let fallbackContent = '';
            try {
                const fallbackMatch = fullResponse.match(/{[\s\S]*}/);
                if (fallbackMatch) {
                    const fallbackJson = JSON.parse(fallbackMatch[0]);
                    fallbackTitle = fallbackJson.title || '';
                    fallbackContent = fallbackJson.content || '';
                }
            } catch (fallbackError) {
                // If still fails, just use the raw response as content
                fallbackContent = fullResponse;
            }
            console.error('Error parsing AI response:', e.message, '\nRaw response:', fullResponse);
            res.json({
                story: {
                    title: fallbackTitle || `A Story for ${studentName}`,
                    content: fallbackContent,
                    generatedAt: new Date().toISOString(),
                    context: context,
                    studentName: studentName
                }
            });
        }
    } catch (err) {
        console.error('Error generating story:', err);
        res.status(500).json({ 
            error: 'Failed to generate story. Please try again later.',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};
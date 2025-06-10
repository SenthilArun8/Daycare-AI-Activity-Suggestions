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
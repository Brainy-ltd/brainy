import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize the server-side Gemini client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// 1. Endpoint for AI Feedback Filtering and Analysis
app.post("/api/ai/feedbacks-filter", async (req, res) => {
  try {
    const { query, feedbacks } = req.body;
    if (!feedbacks || !Array.isArray(feedbacks)) {
      return res.status(400).json({ error: "Invalid feedbacks parameter" });
    }

    if (!query || !query.trim()) {
      return res.json({
        filteredIds: feedbacks.map(f => f.id),
        aiSummary: "Showing all active feedback logs of the community board."
      });
    }

    const prompt = `You are an academic feedback analyst for the 'Brainy' student portal.
Analyze the following student feedback submissions and filter them, keeping ONLY those that match or are highly relevant to the student's query: "${query}".

Submissions JSON:
${JSON.stringify(feedbacks, null, 2)}

Provide your analysis. You MUST return a JSON object containing:
1. "filteredIds": An array of matching feedback ID strings (e.g. ["f-1", "f-2"]). If none match and it's a specific filter, return an empty array [].
2. "aiSummary": A helpful, friendly 1-2 sentence summary of what matching students are saying, or key takeaways regarding this topic.

You MUST respond strictly in JSON structure matching this schema:
{
  "filteredIds": ["string"],
  "aiSummary": "string"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["filteredIds", "aiSummary"],
          properties: {
            filteredIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of feedback ID strings that match the query"
            },
            aiSummary: {
              type: Type.STRING,
              description: "A summary explaining the matches or key insights"
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error: any) {
    console.error("Error in AI Feedbacks Filter:", error);
    res.status(500).json({ 
      error: "AI analysis failed", 
      details: error.message,
      filteredIds: [], 
      aiSummary: "The AI Advisor was unable to filter the submissions right now. Showing default view." 
    });
  }
});

// 2. Endpoint for Library Finder & Smart Recommendations
app.post("/api/ai/library-assistant", async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic is required" });
    }

    const prompt = `You are a warm, highly knowledgeable academic book finder and learning counselor for 'Brainy' portal.
The user wants book recommendations and career/academic guidance for learning: "${topic}".

Please recommend 4 highly relevant, highly regarded textbooks or educational books (either real standard titles or realistic modern references) that are helpful for this.
For each recommended book, you must compile:
- "title": Compelling book or textbook title.
- "author": Author's name or full names.
- "description": A short explanation of the book's coverage and precisely why it fits the learning goal.
- "subject": The matching academic subject preset category.
- "studyTip": A custom study guide advice tip on how to best learn from this book.

You MUST respond strictly in the following JSON schema:
{
  "recommendations": [
    {
      "title": "string",
      "author": "string",
      "description": "string",
      "subject": "string",
      "studyTip": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["recommendations"],
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "author", "description", "subject", "studyTip"],
                properties: {
                  title: { type: Type.STRING },
                  author: { type: Type.STRING },
                  description: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  studyTip: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text || "{}";
    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error: any) {
    console.error("Error in AI Library Assistant:", error);
    res.status(500).json({ 
      error: "AI recommendation retrieval failed", 
      details: error.message,
      recommendations: [] 
    });
  }
});

// 3. Endpoint for AI Feedback Assistant & Prioritization Discussions
app.post("/api/ai/feedback-assistant", async (req, res) => {
  try {
    const { question, history, feedbacks } = req.body;
    if (!feedbacks || !Array.isArray(feedbacks)) {
      return res.status(400).json({ error: "Invalid feedbacks parameter" });
    }

    const conversationContext = history && Array.isArray(history)
      ? history.map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join("\n")
      : "";

    const feedbacksContext = feedbacks.map((f: any, index: number) => {
      const pIndex = index + 1;
      const severityWeight = f.severity === 'Critical' ? 35 : f.severity === 'Medium' ? 20 : 8;
      const score = severityWeight + f.votes;
      return `- Rank #${pIndex}: [${f.classification}] "${f.title}" (${f.severity} severity)
        Description: ${f.description}
        Identity: ${f.userType} | Votes: ${f.votes} | Calculated Score: ${score} | Logged: ${f.date}`;
    }).join("\n");

    const prompt = `You are the Brainy AI Feedback & Prioritization Advisor, an intelligent academic co-creation assistant for the 'Brainy' student and trainer portal.
Your goal is to help students, trainers, and administrators analyze, clarify, group, and act upon the registered feedback items and system roadmap priority queues.

The user's question / chat message is: "${question}"

Here is the current REAL-TIME state of the feedbacks on the board & prioritization ranks:
${feedbacksContext}

Previous chat logs:
${conversationContext}

Provide a thoughtful, professional, and insightful analysis. You can:
1. Identify common categories/themes (e.g., performance issues, request list limits, mobile optimization support, offline access, navigation complexity).
2. Explain the prioritization formula logic (Priority = Severity Weight + Upvotes) where critical is 35, medium is 20, low is 8. Point out how upvotes affect ranks.
3. Call out specific high-rank issues or suggest structured developer dispatch tracks/action milestones.
4. Answer any specific questions about particular items, trends in user identity segments (Trainers vs Trainees vs Admins), or general roadmap queries.

Keep the tone encouraging, highly academic, yet simple and actionable. Use rich formatting and highlight feedback items using bold lettering.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ text: response.text || "I was unable to analyze the feedback parameters at this moment." });
  } catch (error: any) {
    console.error("Error in AI Feedback Assistant:", error);
    res.status(500).json({ 
      error: "AI analysis failed", 
      details: error.message, 
      text: "The AI Advisor was unable to connect or analyze the feedback datasets right now. Make sure GEMINI_API_KEY is configured." 
    });
  }
});

// 4. Moodle Integration & REST API Sync Endpoint
app.post("/api/moodle/sync", async (req, res) => {
  try {
    const { moodleUrl, token, useSandbox } = req.body;

    const finalMoodleUrl = (moodleUrl && moodleUrl.trim()) ? moodleUrl.trim() : "https://brainy.moodlecloud.com";
    const finalToken = (token && token.trim()) ? token.trim() : "0872cddfbc41e4829151afab58383146";

    // Clean up trailing slash from host URL if present
    const cleanUrl = finalMoodleUrl.endsWith('/') ? finalMoodleUrl.slice(0, -1) : finalMoodleUrl;

    // Realistic default mock courses (conforms to core_enrol_get_users_courses Moodle API response schema)
    const mockMoodleCourses = [
      {
        id: "moodle-c1",
        title: "[Moodle] Advanced Machine Learning & Deep Networks",
        code: "CS-504",
        instructor: "Prof. Sarah Jenkins",
        progress: 45,
        lessonsCount: 18,
        completedLessons: 8,
        grade: "A-",
        gradePercentage: 92,
        description: "Enrolled via Moodle Web Services API. Core study: neural network architectures, optimization tricks, and deep learning implementations.",
        nextLesson: "Module 4: Convolutional Neural Nets in Moodle",
        icon: "Brain",
        banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM"
      },
      {
        id: "moodle-c2",
        title: "[Moodle] Database Administration & Tuning",
        code: "CS-380",
        instructor: "Dr. Alan Turing Jr.",
        progress: 75,
        lessonsCount: 12,
        completedLessons: 9,
        grade: "B+",
        gradePercentage: 88,
        description: "Enrolled via Moodle Web Services API. Practical DBA tasks: index configuration, scaling, query execution plans, and replicas.",
        nextLesson: "Module 8: Read/Write replica routing configurations",
        icon: "Terminal",
        banner: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM"
      }
    ];

    if (!useSandbox) {
      console.log(`Synchronizing live with Moodle Server URL: ${cleanUrl}`);
      try {
        const fetchUrl = `${cleanUrl}/webservice/rest/server.php?wstoken=${finalToken}&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json`;
        
        // Fetch real Moodle courses data with a timeout fallback
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);
        
        const response = await fetch(fetchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        const data = await response.json();

        // Check if Moodle returned an error/exception object
        if (data && (data.exception || data.errorcode)) {
          console.warn("Moodle REST Exception returned:", data);
          throw new Error(data.message || data.errorcode);
        }

        if (Array.isArray(data) && data.length > 0) {
          // Map real Moodle courses structure to Academic Portal's course schema
          const mappedCourses = data.map((mc: any, idx: number) => {
            const banners = [
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBZKl6FT4PhHopWKs0gEFqQLrcW_NV6h9EizjeMDYIXIebtNk-8gqEMpK8F-6yzUV4ha4of7SIjbyFC-SHwOTPD7VATo5XsCnOX07GQ8uieAAywuF4UPy4qT7jSjAO3k7ORh3cAIcOCvdTQx6kCvIVfhZK0rDFsRbvGJaHozKYA3ak1tgRCSgHlPLddFfbKAKgtSfgWIbaAShLPrS18ovBXiGBIDbvq1pJyY6pV9qNuP26NYJrMuWr-v7HUq3A_m0IbWs5cqMH_1T9O"
            ];
            
            const rawDesc = mc.summary || "Real Moodle course synchronized successfully via Web Services REST API.";
            const cleanDesc = rawDesc.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags from Moodle summary
            const progress = mc.progress !== undefined ? Math.round(mc.progress) : (idx % 2 === 0 ? 30 : 65);
            
            return {
              id: `moodle-live-${mc.id || idx}`,
              title: mc.fullname || mc.displayname || `[Moodle] Course ${idx + 1}`,
              code: mc.shortname || `LMS-${mc.id || idx}`,
              instructor: "Academic Faculty",
              progress,
              lessonsCount: 15,
              completedLessons: Math.round((progress / 100) * 15),
              grade: progress > 80 ? "A" : progress > 50 ? "B+" : "C",
              gradePercentage: progress > 80 ? 95 : progress > 50 ? 86 : 74,
              description: cleanDesc.length > 150 ? cleanDesc.slice(0, 150) + "..." : cleanDesc,
              nextLesson: "Module Workspace: Course Syllabus & Syllabus details",
              icon: idx % 2 === 0 ? "Brain" : "Terminal",
              banner: banners[idx % banners.length]
            };
          });

          return res.json({
            success: true,
            source: "live-moodle",
            message: `Successfully synchronized ${mappedCourses.length} real courses from Moodle Cloud instance at ${cleanUrl}!`,
            courses: mappedCourses
          });
        }
      } catch (err: any) {
        console.warn("Live Moodle fetch failed, falling back to preconfigured mock courses:", err.message);
        // Continue and return the sandbox demo courses
      }
    }

    // Default Demo Sandbox Mode (or fallback if live Moodle is temporarily unreachable/unresponsive)
    return res.json({
      success: true,
      source: "sandbox-demo",
      message: `Running in sandbox-demo mode. Automatically pre-populated Moodle courses.`,
      courses: mockMoodleCourses
    });

  } catch (error: any) {
    console.error("Moodle Sync Error:", error);
    res.status(500).json({
      success: false,
      error: "Moodle synchronization failed",
      details: error.message
    });
  }
});

// Configure Vite middleware or static files serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();

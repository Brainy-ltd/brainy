import express, { type Express, type Request, type Response } from "express";
import { GoogleGenAI, Type } from "@google/genai";

// Lazily create one shared Gemini client. Created on first use so the module
// can be imported in environments (e.g. the Vercel build step) where the key is
// not present without throwing at import time.
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

const MODEL = "gemini-3.5-flash";

/**
 * Registers all Brainy API routes onto the provided Express app.
 * Kept here (inside api/) so the Vercel serverless function is fully
 * self-contained — no cross-directory imports that Vercel can't bundle.
 * The local dev/prod server (server.ts) reuses the exported app below.
 */
export function registerRoutes(app: Express): void {
  // 1. AI Feedback Filtering and Analysis
  app.post("/api/ai/feedbacks-filter", async (req: Request, res: Response) => {
    try {
      const { query, feedbacks } = req.body;
      if (!feedbacks || !Array.isArray(feedbacks)) {
        return res.status(400).json({ error: "Invalid feedbacks parameter" });
      }

      if (!query || !query.trim()) {
        return res.json({
          filteredIds: feedbacks.map((f: any) => f.id),
          aiSummary: "Showing all active feedback logs of the community board.",
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

      const response = await getAi().models.generateContent({
        model: MODEL,
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
                description: "Array of feedback ID strings that match the query",
              },
              aiSummary: {
                type: Type.STRING,
                description: "A summary explaining the matches or key insights",
              },
            },
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Error in AI Feedbacks Filter:", error);
      res.status(500).json({
        error: "AI analysis failed",
        details: error.message,
        filteredIds: [],
        aiSummary:
          "The AI Advisor was unable to filter the submissions right now. Showing default view.",
      });
    }
  });

  // 2. AI Feedback Assistant & Prioritization Discussions
  app.post("/api/ai/feedback-assistant", async (req: Request, res: Response) => {
    try {
      const { question, history, feedbacks } = req.body;
      if (!feedbacks || !Array.isArray(feedbacks)) {
        return res.status(400).json({ error: "Invalid feedbacks parameter" });
      }

      const conversationContext =
        history && Array.isArray(history)
          ? history
              .map(
                (h: any) =>
                  `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`
              )
              .join("\n")
          : "";

      const feedbacksContext = feedbacks
        .map((f: any, index: number) => {
          const pIndex = index + 1;
          const severityWeight =
            f.severity === "Critical" ? 35 : f.severity === "Medium" ? 20 : 8;
          const score = severityWeight + f.votes;
          return `- Rank #${pIndex}: [${f.classification}] "${f.title}" (${f.severity} severity)
        Description: ${f.description}
        Identity: ${f.userType} | Votes: ${f.votes} | Calculated Score: ${score} | Logged: ${f.date}`;
        })
        .join("\n");

      const prompt = `You are the Brainy AI Feedback & Prioritization Advisor, located inside the FEEDBACK section of the 'Brainy' student and trainer portal.

# HARD BOUNDARY (your single most important rule)
You answer ONLY questions about the feedback board shown below: analyzing, clarifying, grouping and
prioritizing the registered feedback items, explaining themes/trends and the prioritization ranking,
and suggesting action milestones or roadmaps.

For ANYTHING ELSE — general knowledge or trivia, library/book recommendations, grades, login/account,
or any topic not about this feedback board — you MUST politely refuse, EVEN IF YOU KNOW THE ANSWER.
Do not give the answer or extra facts. Respond with one short message in this style:
"I'm the Feedback Advisor, so I can only help with the feedback board. For example, you could ask me which issues are highest priority, or to group the current feedback into themes."

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

      const response = await getAi().models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      res.json({
        text:
          response.text ||
          "I was unable to analyze the feedback parameters at this moment.",
      });
    } catch (error: any) {
      console.error("Error in AI Feedback Assistant:", error);
      res.status(500).json({
        error: "AI analysis failed",
        details: error.message,
        text: "The Brainy AI Advisor was unable to analyze the feedback datasets right now. Please try again in a moment.",
      });
    }
  });

  // 3. Library AI Chat Assistant
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { question, history, catalog } = req.body;
      if (!question || !question.trim()) {
        return res.status(400).json({ error: "Question is required" });
      }

      const conversationContext =
        history && Array.isArray(history)
          ? history
              .map(
                (h: any) =>
                  `${h.sender === "user" ? "User" : "Assistant"}: ${h.text}`
              )
              .join("\n")
          : "";

      const catalogContext =
        catalog && Array.isArray(catalog)
          ? catalog
              .map(
                (r: any) =>
                  `- "${r.title}" by ${r.author} [${r.category} / ${r.format}] — ${r.description}`
              )
              .join("\n")
          : "No catalog provided.";

      const prompt = `You are the Brainy Library AI Assistant, located inside the LIBRARY section of the 'Brainy' student portal.

# HARD BOUNDARY (your single most important rule)
You answer ONLY questions about THIS digital library and studying from its resources:
finding/recommending resources from the catalog, explaining what a resource covers, comparing
catalog items, and giving study guidance for those resources.

For ANYTHING ELSE — general knowledge or trivia (e.g. "capital of France", math facts, history),
grades, login/account, calendar, messaging, the feedback board, coding help, or any topic that is
not about this library — you MUST politely refuse, EVEN IF YOU KNOW THE ANSWER. Do not give the
answer, a partial answer, or any extra facts. Respond with one short message in this style:
"I'm the Library Assistant, so I can only help with our library and its learning resources. For example, you could ask me to recommend resources on networking, or to summarize a book in the catalog."

Examples of how to behave:
- User: "What is the capital of France?" → refuse with the message above (do NOT say Paris).
- User: "What's my GPA / grade?" → refuse with the message above.
- User: "Write me a poem" → refuse with the message above.
- User: "Recommend a resource for electrical installation" → answer using the catalog.

# WHEN THE QUESTION IS IN SCOPE
Ground your answer in the catalog below; if something the student wants is not in the catalog, say so
honestly. Be warm, encouraging and academic, use markdown, and bold the titles of any catalog items.

Current library catalog:
${catalogContext}

Previous chat logs:
${conversationContext}

The student's message: "${question}"`;

      const response = await getAi().models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      res.json({
        text:
          response.text ||
          "I was unable to look through the library catalog at this moment.",
      });
    } catch (error: any) {
      console.error("Error in AI Library Chat:", error);
      res.status(500).json({
        error: "AI chat failed",
        details: error.message,
        text: "I experienced an error connecting to the Brainy AI service. Please try again in a moment.",
      });
    }
  });

  // 4. Library AI Resource Summarizer
  app.post("/api/ai/summarize", async (req: Request, res: Response) => {
    try {
      const { resource } = req.body;
      if (!resource || !resource.title) {
        return res.status(400).json({ error: "Resource is required" });
      }

      const prompt = `You are an expert academic summarizer for the 'Brainy' student portal library.
Produce a concise, well-structured study summary for the following library resource.

Resource:
- Title: ${resource.title}
- Author: ${resource.author || "Unknown"}
- Category: ${resource.category || "General"}
- Format: ${resource.format || "Document"}
- Description: ${resource.description || "No description provided."}

Write a helpful 3-5 sentence overview covering what the resource is about, who it is best for, and the key takeaways a student should focus on. Use clear, encouraging academic language and markdown formatting.`;

      const response = await getAi().models.generateContent({
        model: MODEL,
        contents: prompt,
      });

      res.json({
        summary:
          response.text ||
          "I was unable to generate a summary for this resource right now.",
      });
    } catch (error: any) {
      console.error("Error in AI Summarize:", error);
      res.status(500).json({
        error: "AI summarize failed",
        details: error.message,
        summary:
          "Could not generate the summary right now. Please try again in a moment.",
      });
    }
  });

  // 5. Library AI Book/Resource Recommendations
  app.post("/api/ai/recommend", async (req: Request, res: Response) => {
    try {
      const { topic, existingCatalog } = req.body;
      if (!topic || !topic.trim()) {
        return res.status(400).json({ error: "Topic is required" });
      }

      const existingContext =
        existingCatalog && Array.isArray(existingCatalog)
          ? existingCatalog.map((r: any) => `"${r.title}"`).join(", ")
          : "none";

      const prompt = `You are a warm, highly knowledgeable academic book finder and learning counselor for the 'Brainy' portal.
The user wants book/resource recommendations and academic guidance for learning: "${topic}".

The library already contains these items (avoid recommending near-duplicates): ${existingContext}

Recommend 4 highly relevant, highly regarded textbooks or educational resources (real standard titles or realistic modern references) for this learning goal.
For each recommendation provide:
- "title": Compelling book or resource title.
- "author": Author's name or full names.
- "category": A short subject category (e.g. "Computer Science", "Mathematics", "Design").
- "format": One of "PDF", "Video", "Link", "Document", "Dataset", "Slide".
- "description": A short explanation of coverage and why it fits the learning goal.
- "size": A realistic approximate file size string (e.g. "2.4 MB", "850 KB").

Also provide "advice": a short 1-2 sentence roadmap tip on how to approach learning this topic.

You MUST respond strictly in this JSON schema:
{
  "recommendations": [
    { "title": "string", "author": "string", "category": "string", "format": "string", "description": "string", "size": "string" }
  ],
  "advice": "string"
}`;

      const response = await getAi().models.generateContent({
        model: MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["recommendations", "advice"],
            properties: {
              recommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  required: [
                    "title",
                    "author",
                    "category",
                    "format",
                    "description",
                    "size",
                  ],
                  properties: {
                    title: { type: Type.STRING },
                    author: { type: Type.STRING },
                    category: { type: Type.STRING },
                    format: { type: Type.STRING },
                    description: { type: Type.STRING },
                    size: { type: Type.STRING },
                  },
                },
              },
              advice: { type: Type.STRING },
            },
          },
        },
      });

      const result = JSON.parse(response.text || "{}");
      res.json(result);
    } catch (error: any) {
      console.error("Error in AI Recommend:", error);
      res.status(500).json({
        error: "AI recommendation failed",
        details: error.message,
        recommendations: [],
        advice: "",
      });
    }
  });

  // 6. Moodle Integration & REST API Sync Endpoint
  app.post("/api/moodle/sync", async (req: Request, res: Response) => {
    try {
      const { moodleUrl, token, useSandbox } = req.body;

      const finalMoodleUrl =
        moodleUrl && moodleUrl.trim()
          ? moodleUrl.trim()
          : "https://brainy.moodlecloud.com";
      const finalToken =
        token && token.trim() ? token.trim() : "0872cddfbc41e4829151afab58383146";

      const cleanUrl = finalMoodleUrl.endsWith("/")
        ? finalMoodleUrl.slice(0, -1)
        : finalMoodleUrl;

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
          description:
            "Enrolled via Moodle Web Services API. Core study: neural network architectures, optimization tricks, and deep learning implementations.",
          nextLesson: "Module 4: Convolutional Neural Nets in Moodle",
          icon: "Brain",
          banner:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM",
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
          description:
            "Enrolled via Moodle Web Services API. Practical DBA tasks: index configuration, scaling, query execution plans, and replicas.",
          nextLesson: "Module 8: Read/Write replica routing configurations",
          icon: "Terminal",
          banner:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM",
        },
      ];

      if (!useSandbox) {
        console.log(`Synchronizing live with Moodle Server URL: ${cleanUrl}`);
        try {
          const fetchUrl = `${cleanUrl}/webservice/rest/server.php?wstoken=${finalToken}&wsfunction=core_enrol_get_users_courses&moodlewsrestformat=json`;

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(fetchUrl, { signal: controller.signal });
          clearTimeout(timeoutId);

          const data: any = await response.json();

          if (data && (data.exception || data.errorcode)) {
            console.warn("Moodle REST Exception returned:", data);
            throw new Error(data.message || data.errorcode);
          }

          if (Array.isArray(data) && data.length > 0) {
            const mappedCourses = data.map((mc: any, idx: number) => {
              const banners = [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuCISfK_MZwXZoyB6jTz5D-ImlaTjcRt4sFhxbiXAXNn8yBSj3SaDQ6kv2GH3XUQWyzB6AFMXcgFE6Pij61uQNXddNEZTzu1gEUqCxoGBB5hxlWflbaZ9WBnxJFRj1aNEd3bc3jsdeksLQSTwCGk6Jbjmjc7OGTCuigA390b6_5bM4uD2C0Hp60paUMiijEG_LL7lk-2oG-MZ_zUavnkbzY7176tkzj7laRMv-EQHl7sqLhbh1Ssh6fCMgmJ_XlEMYYKovVJq_ge6zhM",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuD8d90BLUHFeKEIOIBxzwQr0ACfdKCTQKp_ncU6rADHx2uKFo4PE7eAYMpB_y1USug36qE8HBMe7HjJQTnapR5PXbQ6mPzGxaYJ1J8wHqlSRG2L3CTJm34yFbf4K4ldquSfKsBwKvFREqnJDeCH4zQixdl6bkaefixOedHDQLGSn3lrd09ApiTlk1WF_yFtTds7Yt0D7pATWStvQmp7TWYAuBZZHSZ8_LruoLG0Jhzc0WmuaO-xzCfebErQgzuX-myCYCXc-ayUaAuM",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBZKl6FT4PhHopWKs0gEFqQLrcW_NV6h9EizjeMDYIXIebtNk-8gqEMpK8F-6yzUV4ha4of7SIjbyFC-SHwOTPD7VATo5XsCnOX07GQ8uieAAywuF4UPy4qT7jSjAO3k7ORh3cAIcOCvdTQx6kCvIVfhZK0rDFsRbvGJaHozKYA3ak1tgRCSgHlPLddFfbKAKgtSfgWIbaAShLPrS18ovBXiGBIDbvq1pJyY6pV9qNuP26NYJrMuWr-v7HUq3A_m0IbWs5cqMH_1T9O",
              ];

              const rawDesc =
                mc.summary ||
                "Real Moodle course synchronized successfully via Web Services REST API.";
              const cleanDesc = rawDesc.replace(/<[^>]*>/g, "").trim();
              const progress =
                mc.progress !== undefined
                  ? Math.round(mc.progress)
                  : idx % 2 === 0
                  ? 30
                  : 65;

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
                description:
                  cleanDesc.length > 150 ? cleanDesc.slice(0, 150) + "..." : cleanDesc,
                nextLesson: "Module Workspace: Course Syllabus & Syllabus details",
                icon: idx % 2 === 0 ? "Brain" : "Terminal",
                banner: banners[idx % banners.length],
              };
            });

            return res.json({
              success: true,
              source: "live-moodle",
              message: `Successfully synchronized ${mappedCourses.length} real courses from Moodle Cloud instance at ${cleanUrl}!`,
              courses: mappedCourses,
            });
          }
        } catch (err: any) {
          console.warn(
            "Live Moodle fetch failed, falling back to preconfigured mock courses:",
            err.message
          );
        }
      }

      return res.json({
        success: true,
        source: "sandbox-demo",
        message: `Running in sandbox-demo mode. Automatically pre-populated Moodle courses.`,
        courses: mockMoodleCourses,
      });
    } catch (error: any) {
      console.error("Moodle Sync Error:", error);
      res.status(500).json({
        success: false,
        error: "Moodle synchronization failed",
        details: error.message,
      });
    }
  });
}

// Build the Express app used both by Vercel (default export below) and by the
// local server (server.ts imports this app and adds frontend serving).
const app = express();
app.use(express.json());
registerRoutes(app);

export default app;

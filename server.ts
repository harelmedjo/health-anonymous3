import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import {
  dbGetConditions,
  dbUpsertCondition,
  dbDeleteCondition,
  dbGetPosts,
  dbAddPost,
  dbLikePost,
  dbDeletePost,
  dbApprovePost,
  dbGetComments,
  dbAddComment,
  dbDeleteComment,
  dbGetAudits,
  dbLogAudit,
  dbGetMedications,
  dbUpsertMedication,
  dbDeleteMedication,
  dbGetPrivateMessages,
  dbAddPrivateMessage,
  dbGetDirectChats,
  dbAddUserBlock,
  dbCheckUserBlocked,
  dbGetNotifications,
  dbAddNotification,
  dbMarkNotificationsRead,
  dbGetUser,
  dbAddUser
} from "./src/db";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Log all api access
  app.use((req, res, next) => {
    console.log(`[API LOG] ${req.method} ${req.url}`);
    next();
  });

  // API Route: AI Secure Medical Teaching Assistant chat proxy
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Missing or invalid messages array" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not set on the server." });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Map messages to Gemini SDK schemas
      const formattedContents = messages.map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction: "You are an empathetic and professional medical helper in the 'Health Anonymous' community app. Your role is to provide safe, objective, educational information in response to health concerns, symptoms, or medical concepts. Always maintain strict anonymity boundaries — do not ask for real identity details. Encourage healthy living, describe common guidelines, and always structure responses beautifully in markdown. Crucially, end every single answer with a concise, bold medical disclaimer: 'This is educational information and NOT professional medical advice. Always consult a qualified healthcare provider for medical concerns.'"
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get clinical conditions list
  app.get("/api/conditions", async (req, res) => {
    try {
      const result = await dbGetConditions();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Create or edit condition (Admin functionality)
  app.post("/api/conditions", async (req, res) => {
    try {
      const cond = req.body;
      if (!cond.id || !cond.nameEn || !cond.nameFr) {
        return res.status(400).json({ error: "Missing required conditions parameters" });
      }
      await dbUpsertCondition(cond);
      res.status(200).json({ success: true, message: "Condition upserted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Delete condition (Admin functionality)
  app.delete("/api/conditions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbDeleteCondition(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Retrieve support posts
  app.get("/api/posts", async (req, res) => {
    try {
      const conditionId = req.query.conditionId as string | undefined;
      const includePending = req.query.includePending === "true";
      const userAlias = req.query.userAlias as string | undefined;
      const result = await dbGetPosts(conditionId, includePending, userAlias);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Approve support post (Admin action)
  app.post("/api/posts/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      await dbApprovePost(id);
      res.status(200).json({ success: true, message: "Post approved successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Create support posts
  app.post("/api/posts", async (req, res) => {
    try {
      const post = req.body;
      if (!post.id || !post.conditionId || !post.content || !post.authorAlias) {
        return res.status(400).json({ error: "Missing required posting parameters" });
      }
      
      // Security defense check: Prevent non-admins from trying to submit posts already marked as approved
      const postData = { ...post, status: "pending" };
      
      await dbAddPost(postData);
      res.status(201).json({ success: true, post: postData });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Increment likes
  app.post("/api/posts/:id/like", async (req, res) => {
    try {
      const { id } = req.params;
      await dbLikePost(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Delete support post (Admin Moderate activity)
  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbDeletePost(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get replies/comments
  app.get("/api/comments", async (req, res) => {
    try {
      const postId = req.query.postId as string | undefined;
      const result = await dbGetComments(postId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Write replies
  app.post("/api/comments", async (req, res) => {
    try {
      const comment = req.body;
      if (!comment.id || !comment.postId || !comment.content || !comment.authorAlias) {
        return res.status(400).json({ error: "Missing reply details" });
      }
      await dbAddComment(comment);
      res.status(201).json({ success: true, comment });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Delete reply (Admin Moderate activity)
  app.delete("/api/comments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbDeleteComment(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: User Registration 
  app.post("/api/users/register", async (req, res) => {
    try {
      const { username, password, anonymousAlias } = req.body;
      if (!username || !password || !anonymousAlias) {
        return res.status(400).json({ error: "Missing required registration parameters" });
      }

      const normalizedUsername = username.trim().toLowerCase();
      if (normalizedUsername === "admin" || normalizedUsername === "administrator") {
        return res.status(400).json({ error: "Username 'admin' is reserved by security policies." });
      }

      const isGmail = normalizedUsername.includes("gmail.com") || normalizedUsername.includes("@gmail");
      const existingUser = await dbGetUser(username);
      if (existingUser) {
        if (isGmail) {
          // Accept Gmail register/login already if password is correct to maintain state consistency
          if (existingUser.password === password) {
            return res.status(200).json({ success: true, username: existingUser.username, anonymousAlias: existingUser.anonymousAlias });
          } else {
            return res.status(400).json({ error: "Gmail address is already registered with another password. Please check your password or Use Sign-In mode." });
          }
        }
        return res.status(400).json({ error: "Username is already registered. Please sign in instead." });
      }

      await dbAddUser(username, password, anonymousAlias);
      res.status(201).json({ success: true, username, anonymousAlias });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: User Login
  app.post("/api/users/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing required login parameters" });
      }

      const user = await dbGetUser(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid username or password credentials." });
      }

      res.status(200).json({ success: true, username: user.username, anonymousAlias: user.anonymousAlias });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Admin Login Check (credentials: admin / admin123)
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (username === "admin" && password === "admin123") {
        await dbLogAudit("Admin Authentication", `Successful admin access login.`);
        return res.status(200).json({
          authenticated: true,
          token: "admin-jwt-mockup-token-9382",
          user: { role: "admin", verified: true }
        });
      }
      await dbLogAudit("Failed Authentication Attempt", `Failed login credentials check for: ${username}`);
      return res.status(401).json({ error: "Invalid admin username or password details. Read guidelines for defaults." });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Audit logs for admin panel view
  app.get("/api/admin/audits", async (req, res) => {
    try {
      const logs = await dbGetAudits();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get statistics summaries matching audit charts
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const conditions = await dbGetConditions();
      const posts = await dbGetPosts();
      const comments = await dbGetComments();
      const medications = await dbGetMedications();
      res.json({
        totalConditions: conditions.length,
        totalPosts: posts.length,
        totalComments: comments.length,
        totalMedications: medications.length,
        totalAnonymousMembersCount: "98.4k simulated members active"
      });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get list of medications
  app.get("/api/medications", async (req, res) => {
    try {
      const result = await dbGetMedications();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Upsert medication (Admin)
  app.post("/api/medications", async (req, res) => {
    try {
      const med = req.body;
      if (!med.id || !med.nameEn || !med.nameFr) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      await dbUpsertMedication(med);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Delete medication (Admin)
  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await dbDeleteMedication(id);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get direct chats/aliases with whom user has conversed
  app.get("/api/chats", async (req, res) => {
    try {
      const alias = req.query.alias as string;
      if (!alias) {
        return res.status(400).json({ error: "Client user alias identifier is required" });
      }
      const chats = await dbGetDirectChats(alias);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get messaging chat history list between two aliases
  app.get("/api/messages", async (req, res) => {
    try {
      const { user, peer } = req.query;
      if (!user || !peer) {
        return res.status(400).json({ error: "User and peer identifiers must be present" });
      }
      const history = await dbGetPrivateMessages(user as string, peer as string);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Send secure message
  app.post("/api/messages", async (req, res) => {
    try {
      const msg = req.body;
      if (!msg.senderAlias || !msg.recipientAlias || !msg.content) {
        return res.status(400).json({ error: "Sender alias, recipient, and content are required parameters" });
      }
      await dbAddPrivateMessage(msg);
      res.status(201).json({ success: true, msg });
    } catch (error: any) {
      res.status(403).json({ error: error?.message || "Could not deliver message." });
    }
  });

  // REST API Route: Block another user alias
  app.post("/api/blocks", async (req, res) => {
    try {
      const { blocking, blocked } = req.body;
      if (!blocking || !blocked) {
        return res.status(400).json({ error: "Blocking and blocked aliases are required" });
      }
      await dbAddUserBlock(blocking, blocked);
      await dbLogAudit("User Block Completed", `Confidential alias: ${blocking} blocked client: ${blocked}`);
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Get app notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const result = await dbGetNotifications();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Add notification (mostly system trigger / simulation)
  app.post("/api/notifications", async (req, res) => {
    try {
      const notif = req.body;
      await dbAddNotification(notif);
      res.status(201).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // REST API Route: Mark notifications as read
  app.post("/api/notifications/read", async (req, res) => {
    try {
      await dbMarkNotificationsRead();
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || "Internal server error" });
    }
  });

  // Serve static paths/Vite in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
  });
}

startServer();

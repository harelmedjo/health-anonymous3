import { Pool } from "pg";
import { Condition, GroupPost, GroupComment, Medication, PrivateMessage, AppNotification, DirectChat } from "./types";
import { CONDITIONS, INITIAL_GROUP_POSTS, INITIAL_GROUP_COMMENTS } from "./data";

let pool: Pool | null = null;
let isPostgres = false;

export const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "metformin",
    nameEn: "Metformin",
    nameFr: "Metformine",
    usageEn: "Oral antidiabetic medication to manage type 2 diabetes by improving insulin sensitivity and lowering glucose levels.",
    usageFr: "Médicament antidiabétique oral pour gérer le diabète de type 2 en améliorant la sensibilité à l'insuline et en abaissant les niveaux de glucose.",
    dosageEn: "Typically started at 500mg twice daily with meals, max 2000mg daily.",
    dosageFr: "Généralement commencé à 500 mg deux fois par jour avec les repas, maximum 2000 mg par jour.",
    sideEffectsEn: "Nausea, diarrhea, abdominal pain, metallic taste.",
    sideEffectsFr: "Nausées, diarrhée, douleurs abdominales, goût métallique.",
    warningsEn: "Avoid excess alcohol consumption. Risk of lactic acidosis in physical or kidney distress.",
    warningsFr: "Éviter la consommation excessive d'alcool. Risque d'acidose lactique en cas de détresse physique ou rénale.",
    category: "Chronic"
  },
  {
    id: "sertraline",
    nameEn: "Sertraline",
    nameFr: "Sertraline",
    usageEn: "Selective serotonin reuptake inhibitor (SSRI) used to treat depression, anxiety disorders, and panic attacks.",
    usageFr: "Inhibiteur sélectif de la recapture de la sérotonine (ISRS) utilisé pour traiter la dépression, les troubles anxieux et les attaques de panique.",
    dosageEn: "Start at 25mg-50mg once daily, adjusted by physician up to 200mg daily.",
    dosageFr: "Commencer à 25 mg - 50 mg une fois par jour, ajusté par le médecin jusqu'à 200 mg par jour.",
    sideEffectsEn: "Dry mouth, sweating, insomnia, nausea, initial anxiety flare.",
    sideEffectsFr: "Bouche sèche, transpiration, insomnie, nausées, poussée d'anxiété initiale.",
    warningsEn: "Do not stop abruptly. Risk of serotonin syndrome or withdrawal symptom flares.",
    warningsFr: "Ne pas arrêter brusquement. Risque de syndrome sérotoninergique ou de poussées de symptômes de sevrage.",
    category: "Mental Health"
  },
  {
    id: "ibuprofen",
    nameEn: "Ibuprofen",
    nameFr: "Ibuprofène",
    usageEn: "Nonsteroidal anti-inflammatory drug (NSAID) used to reduce pain, fever, and inflammation in rheumatoid or chronic conditions.",
    usageFr: "Anti-inflammatoire non stéroïdien (AINS) utilisé pour réduire la douleur, la fièvre et l'inflammation dans les affections de type chronique.",
    dosageEn: "200mg-400mg every 4 to 6 hours when pain occurs, up to 1200mg daily.",
    dosageFr: "200 mg - 400 mg toutes les 4 à 6 heures en cas de douleur, jusqu'à 1200 mg par jour.",
    sideEffectsEn: "Stomach upset, headache, mild dizziness, elevated blood pressure.",
    sideEffectsFr: "Maux d'estomac, maux de tête, légers étourdissements, tension artérielle élevée.",
    warningsEn: "Take with food to protect gastric lining. Long-term use can affect kidney health.",
    warningsFr: "Prendre avec de la nourriture pour protéger la muqueuse gastrique. L'utilisation à long terme affecte la santé rénale.",
    category: "Chronic"
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    titleEn: "Secure Support Active",
    titleFr: "Soutien sécurisé actif",
    contentEn: "Welcome to the bilingual peer-to-peer secure app. Tap on any user's alias in a support group to write a secure direct confidential msg.",
    contentFr: "Bienvenue sur l'application sécurisée par les pairs. Appuyez sur l'alias d'un utilisateur pour lui envoyer un message direct anonyme.",
    timestamp: "Just now",
    isRead: false
  }
];

// Fallback in-memory database store
const memoryDb = {
  conditions: [...CONDITIONS],
  posts: INITIAL_GROUP_POSTS.map(val => ({ ...val, status: "approved" as const })),
  comments: [...INITIAL_GROUP_COMMENTS],
  medications: [...INITIAL_MEDICATIONS],
  privateMessages: [] as PrivateMessage[],
  blockedUsers: [] as { blocking: string; blocked: string }[],
  notifications: [...INITIAL_NOTIFICATIONS],
  users: [] as { username: string; password: string; anonymousAlias: string }[],
  audits: [
    { id: 1, action: "System Started", details: "Memory Fallback Activated", timestamp: new Date().toISOString() }
  ]
};

// Lazy initialization of PG database
export async function getDb() {
  if (pool) return { pool, isPostgres, memoryDb };

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("⚠️ DATABASE_URL not set. Falling back to secure in-memory database with initial simulation records.");
    isPostgres = false;
    return { pool: null, isPostgres, memoryDb };
  }

  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
      ssl: connectionString.includes("localhost") || connectionString.includes("127.0.0.1") ? false : { rejectUnauthorized: false }
    });

    // Test connection
    const client = await pool.connect();
    client.release();
    isPostgres = true;
    console.log("🌐 Successfully connected to PostgreSQL!");
    await setupPostgresTables();
  } catch (err: any) {
    console.error("❌ Failed to initiate PostgreSQL connection, falling back to in-memory state:", err.message);
    pool = null;
    isPostgres = false;
  }

  return { pool, isPostgres, memoryDb };
}

async function setupPostgresTables() {
  if (!pool) return;

  const createConditionsTable = `
    CREATE TABLE IF NOT EXISTS conditions (
      id VARCHAR(50) PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_fr TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      description_en TEXT NOT NULL,
      description_fr TEXT NOT NULL,
      members_count VARCHAR(20) NOT NULL,
      resources_count_en TEXT NOT NULL,
      resources_count_fr TEXT NOT NULL,
      icon VARCHAR(50) NOT NULL
    );
  `;

  const createMedicationsTable = `
    CREATE TABLE IF NOT EXISTS medications (
      id VARCHAR(50) PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_fr TEXT NOT NULL,
      usage_en TEXT NOT NULL,
      usage_fr TEXT NOT NULL,
      dosage_en TEXT NOT NULL,
      dosage_fr TEXT NOT NULL,
      side_effects_en TEXT NOT NULL,
      side_effects_fr TEXT NOT NULL,
      warnings_en TEXT NOT NULL,
      warnings_fr TEXT NOT NULL,
      category VARCHAR(50) NOT NULL
    );
  `;

  const createPrivateMessagesTable = `
    CREATE TABLE IF NOT EXISTS private_messages (
      id VARCHAR(50) PRIMARY KEY,
      chat_id VARCHAR(100) NOT NULL,
      sender_alias VARCHAR(100) NOT NULL,
      recipient_alias VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      media_url TEXT
    );
  `;

  const createUserBlocksTable = `
    CREATE TABLE IF NOT EXISTS user_blocks (
      id SERIAL PRIMARY KEY,
      blocking_alias VARCHAR(100) NOT NULL,
      blocked_alias VARCHAR(100) NOT NULL
    );
  `;

  const createNotificationsTable = `
    CREATE TABLE IF NOT EXISTS app_notifications (
      id VARCHAR(50) PRIMARY KEY,
      title_en TEXT NOT NULL,
      title_fr TEXT NOT NULL,
      content_en TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE
    );
  `;

  const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
      id VARCHAR(50) PRIMARY KEY,
      condition_id VARCHAR(50) NOT NULL,
      author_alias VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      likes INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'pending'
    );
  `;

  const createCommentsTable = `
    CREATE TABLE IF NOT EXISTS comments (
      id VARCHAR(50) PRIMARY KEY,
      post_id VARCHAR(50) NOT NULL,
      author_alias VARCHAR(100) NOT NULL,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );
  `;

  const createAuditsTable = `
    CREATE TABLE IF NOT EXISTS admin_audits (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      details TEXT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS app_users (
      username VARCHAR(100) PRIMARY KEY,
      password VARCHAR(100) NOT NULL,
      anonymous_alias VARCHAR(100) NOT NULL
    );
  `;

  try {
    await pool.query(createConditionsTable);
    await pool.query(createMedicationsTable);
    await pool.query(createPrivateMessagesTable);
    await pool.query(createUserBlocksTable);
    await pool.query(createNotificationsTable);
    await pool.query(createPostsTable);
    await pool.query(createCommentsTable);
    await pool.query(createAuditsTable);
    await pool.query(createUsersTable);

    // Apply migrations / dynamic alterations for Posts Table
    try {
      await pool.query("ALTER TABLE posts ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'");
    } catch (colErr: any) {
      console.warn("Could not alter posts table to add status column:", colErr.message);
    }

    // Populate default conditions if table is empty
    const checkConds = await pool.query("SELECT COUNT(*) FROM conditions");
    if (parseInt(checkConds.rows[0].count) === 0) {
      console.log("Empty conditions table. Seeding initial conditions...");
      for (const cond of CONDITIONS) {
        await pool.query(
          `INSERT INTO conditions 
           (id, name_en, name_fr, category, description_en, description_fr, members_count, resources_count_en, resources_count_fr, icon) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [cond.id, cond.nameEn, cond.nameFr, cond.category, cond.descriptionEn, cond.descriptionFr, cond.membersCount, cond.resourcesCountEn, cond.resourcesCountFr, cond.icon]
        );
      }
    }

    // Populate default medications if table is empty
    const checkMeds = await pool.query("SELECT COUNT(*) FROM medications");
    if (parseInt(checkMeds.rows[0].count) === 0) {
      console.log("Empty medications table. Seeding initial medications...");
      for (const med of INITIAL_MEDICATIONS) {
        await pool.query(
          `INSERT INTO medications 
           (id, name_en, name_fr, usage_en, usage_fr, dosage_en, dosage_fr, side_effects_en, side_effects_fr, warnings_en, warnings_fr, category) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          [med.id, med.nameEn, med.nameFr, med.usageEn, med.usageFr, med.dosageEn, med.dosageFr, med.sideEffectsEn, med.sideEffectsFr, med.warningsEn, med.warningsFr, med.category]
        );
      }
    }

    // Populate notifications if empty
    const checkNotifs = await pool.query("SELECT COUNT(*) FROM app_notifications");
    if (parseInt(checkNotifs.rows[0].count) === 0) {
      for (const n of INITIAL_NOTIFICATIONS) {
        await pool.query(
          `INSERT INTO app_notifications (id, title_en, title_fr, content_en, content_fr, timestamp, is_read) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [n.id, n.titleEn, n.titleFr, n.contentEn, n.contentFr, n.timestamp, n.isRead]
        );
      }
    }

    // Populate default posts if table is empty
    const checkPosts = await pool.query("SELECT COUNT(*) FROM posts");
    if (parseInt(checkPosts.rows[0].count) === 0) {
      console.log("Empty posts table. Seeding initial support forum logs...");
      for (const post of INITIAL_GROUP_POSTS) {
        await pool.query(
          `INSERT INTO posts (id, condition_id, author_alias, content, timestamp, likes, comments_count, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [post.id, post.conditionId, post.authorAlias, post.content, post.timestamp, post.likes, post.commentsCount, "approved"]
        );
      }
    } else {
      // In case table was already seeded prior to column release, fill NULL status fields
      await pool.query("UPDATE posts SET status = 'approved' WHERE status IS NULL");
    }

    // Populate default comments if table is empty
    const checkComments = await pool.query("SELECT COUNT(*) FROM comments");
    if (parseInt(checkComments.rows[0].count) === 0) {
      console.log("Seeding default responses...");
      for (const comm of INITIAL_GROUP_COMMENTS) {
        await pool.query(
          `INSERT INTO comments (id, post_id, author_alias, content, timestamp) 
           VALUES ($1, $2, $3, $4, $5)`,
          [comm.id, comm.postId, comm.authorAlias, comm.content, comm.timestamp]
        );
      }
    }
  } catch (err: any) {
    console.error("Failed to run schema/seeds configuration on PostgreSQL:", err.message);
  }
}

// Global DB access helper utilities
export async function dbGetConditions(): Promise<Condition[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const res = await p.query("SELECT * FROM conditions");
    return res.rows.map(row => ({
      id: row.id,
      nameEn: row.name_en,
      nameFr: row.name_fr,
      category: row.category,
      descriptionEn: row.description_en,
      descriptionFr: row.description_fr,
      membersCount: row.members_count,
      resourcesCountEn: row.resources_count_en,
      resourcesCountFr: row.resources_count_fr,
      icon: row.icon
    }));
  }
  return md.conditions;
}

export async function dbUpsertCondition(cond: Condition): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query(
      `INSERT INTO conditions (id, name_en, name_fr, category, description_en, description_fr, members_count, resources_count_en, resources_count_fr, icon) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET 
         name_en = EXCLUDED.name_en,
         name_fr = EXCLUDED.name_fr,
         category = EXCLUDED.category,
         description_en = EXCLUDED.description_en,
         description_fr = EXCLUDED.description_fr,
         members_count = EXCLUDED.members_count,
         resources_count_en = EXCLUDED.resources_count_en,
         resources_count_fr = EXCLUDED.resources_count_fr,
         icon = EXCLUDED.icon`,
      [cond.id, cond.nameEn, cond.nameFr, cond.category, cond.descriptionEn, cond.descriptionFr, cond.membersCount, cond.resourcesCountEn, cond.resourcesCountFr, cond.icon]
    );
    await dbLogAudit("Upsert Condition", `Condition id=${cond.id} was created or edited.`);
    return;
  }

  const idx = md.conditions.findIndex(c => c.id === cond.id);
  if (idx !== -1) {
    md.conditions[idx] = cond;
  } else {
    md.conditions.push(cond);
  }
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Upsert Condition",
    details: `Condition id=${cond.id} was created or edited in-memory.`,
    timestamp: new Date().toISOString()
  });
}

export async function dbDeleteCondition(id: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("DELETE FROM conditions WHERE id = $1", [id]);
    await p.query("DELETE FROM posts WHERE condition_id = $1", [id]);
    await dbLogAudit("Delete Condition", `Condition id=${id} and all related posts were deleted.`);
    return;
  }

  md.conditions = md.conditions.filter(c => c.id !== id);
  md.posts = md.posts.filter(p => p.conditionId !== id);
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Delete Condition",
    details: `Condition id=${id} and related posts deleted in-memory.`,
    timestamp: new Date().toISOString()
  });
}

export async function dbGetPosts(conditionId?: string | null, includePending = false, userAlias?: string | null): Promise<GroupPost[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    let query = "SELECT * FROM posts";
    let params: any[] = [];
    if (conditionId) {
      if (includePending) {
        query = "SELECT * FROM posts WHERE condition_id = $1 ORDER BY id DESC";
        params = [conditionId];
      } else if (userAlias) {
        query = "SELECT * FROM posts WHERE condition_id = $1 AND (COALESCE(status, 'approved') = 'approved' OR LOWER(author_alias) = LOWER($2)) ORDER BY id DESC";
        params = [conditionId, userAlias];
      } else {
        query = "SELECT * FROM posts WHERE condition_id = $1 AND COALESCE(status, 'approved') = 'approved' ORDER BY id DESC";
        params = [conditionId];
      }
    } else {
      if (includePending) {
        query = "SELECT * FROM posts ORDER BY id DESC";
      } else if (userAlias) {
        query = "SELECT * FROM posts WHERE COALESCE(status, 'approved') = 'approved' OR LOWER(author_alias) = LOWER($1) ORDER BY id DESC";
        params = [userAlias];
      } else {
        query = "SELECT * FROM posts WHERE COALESCE(status, 'approved') = 'approved' ORDER BY id DESC";
      }
    }
    const res = await p.query(query, params);
    return res.rows.map(row => ({
      id: row.id,
      conditionId: row.condition_id,
      authorAlias: row.author_alias,
      content: row.content,
      timestamp: row.timestamp,
      likes: row.likes,
      commentsCount: row.comments_count,
      status: row.status || 'approved'
    }));
  }

  let list = md.posts;
  if (conditionId) {
    list = list.filter(pos => pos.conditionId === conditionId);
  }
  if (!includePending) {
    list = list.filter(pos => 
      (pos.status || 'approved') === 'approved' || 
      (userAlias && pos.authorAlias?.toLowerCase() === userAlias.toLowerCase())
    );
  }
  return list;
}

export async function dbAddPost(post: GroupPost): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  const isAuthorAdmin = post.authorAlias?.toLowerCase() === 'admin' || post.authorAlias === 'Administrator';
  const postStatus = isAuthorAdmin ? 'approved' : (post.status || 'pending');
  const postObj = { ...post, status: postStatus as any };

  if (ip && p) {
    await p.query(
      `INSERT INTO posts (id, condition_id, author_alias, content, timestamp, likes, comments_count, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [postObj.id, postObj.conditionId, postObj.authorAlias, postObj.content, postObj.timestamp, postObj.likes, postObj.commentsCount, postObj.status]
    );
  } else {
    md.posts.unshift(postObj);
  }

  // Generate appropriate notification
  const notifId = `notif_post_${Date.now()}`;
  let notif: AppNotification;

  if (postObj.status === 'approved') {
    const truncated = postObj.content.length > 50 
      ? postObj.content.substring(0, 47) + "..." 
      : postObj.content;

    notif = {
      id: notifId,
      titleEn: `📢 Latest Approved Post`,
      titleFr: `📢 Dernier message approuvé`,
      contentEn: `New post by "${postObj.authorAlias}": "${truncated}"`,
      contentFr: `Nouveau message par "${postObj.authorAlias}": "${truncated}"`,
      timestamp: "Just now",
      isRead: false
    };
  } else {
    notif = {
      id: notifId,
      titleEn: `🔒 Feed Security: Post Under Verification`,
      titleFr: `🔒 Sécurité du flux : Publication en cours de vérification`,
      contentEn: `confidential user "${postObj.authorAlias}" submitted a post under "${postObj.conditionId}". Please review and authorize.`,
      contentFr: `L'utilisateur anonyme "${postObj.authorAlias}" a soumis un post sous "${postObj.conditionId}". Veuillez autoriser.`,
      timestamp: "Just now",
      isRead: false
    };
  }

  if (ip && p) {
    await p.query(
      `INSERT INTO app_notifications (id, title_en, title_fr, content_en, content_fr, timestamp, is_read) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [notif.id, notif.titleEn, notif.titleFr, notif.contentEn, notif.contentFr, notif.timestamp, notif.isRead]
    );
  } else {
    md.notifications.unshift(notif);
  }

  await dbLogAudit(
    "Security Post Submission", 
    `A secure anonymous post with code id=${postObj.id} is registered in state '${postObj.status}'.`
  );
}

export async function dbLikePost(postId: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("UPDATE posts SET likes = likes + 1 WHERE id = $1", [postId]);
    return;
  }
  const post = md.posts.find(pos => pos.id === postId);
  if (post) {
    post.likes += 1;
  }
}

export async function dbDeletePost(postId: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("DELETE FROM posts WHERE id = $1", [postId]);
    await p.query("DELETE FROM comments WHERE post_id = $1", [postId]);
    await dbLogAudit("Delete Post", `Moderator deleted/denied post id=${postId}`);
    return;
  }
  md.posts = md.posts.filter(pos => pos.id !== postId);
  md.comments = md.comments.filter(c => c.postId !== postId);
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Delete Post",
    details: `Moderator deleted/denied post id=${postId} in-memory.`,
    timestamp: new Date().toISOString()
  });
}

export async function dbApprovePost(postId: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  let approvedPost: GroupPost | undefined;

  if (ip && p) {
    await p.query("UPDATE posts SET status = 'approved' WHERE id = $1", [postId]);
    const res = await p.query("SELECT * FROM posts WHERE id = $1", [postId]);
    if (res.rowCount && res.rowCount > 0) {
      const row = res.rows[0];
      approvedPost = {
        id: row.id,
        conditionId: row.condition_id,
        authorAlias: row.author_alias,
        content: row.content,
        timestamp: row.timestamp,
        likes: row.likes,
        commentsCount: row.comments_count,
        status: row.status || 'approved'
      };
    }
    await dbLogAudit("Approve Post", `Admin authorized post with code id=${postId}.`);
  } else {
    const post = md.posts.find(pos => pos.id === postId);
    if (post) {
      post.status = 'approved';
      approvedPost = post;
    }
    md.audits.unshift({
      id: md.audits.length + 1,
      action: "Approve Post",
      details: `Admin authorized post with code id=${postId} in-memory.`,
      timestamp: new Date().toISOString()
    });
  }

  if (approvedPost) {
    const notifId = `notif_post_approved_${Date.now()}`;
    const truncated = approvedPost.content.length > 50 
      ? approvedPost.content.substring(0, 47) + "..." 
      : approvedPost.content;

    const notif: AppNotification = {
      id: notifId,
      titleEn: `📢 Latest Approved Post`,
      titleFr: `📢 Dernier message approuvé`,
      contentEn: `New post by "${approvedPost.authorAlias}": "${truncated}"`,
      contentFr: `Nouveau message par "${approvedPost.authorAlias}": "${truncated}"`,
      timestamp: "Just now",
      isRead: false
    };

    if (ip && p) {
      await p.query(
        `INSERT INTO app_notifications (id, title_en, title_fr, content_en, content_fr, timestamp, is_read) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [notif.id, notif.titleEn, notif.titleFr, notif.contentEn, notif.contentFr, notif.timestamp, notif.isRead]
      );
    } else {
      md.notifications.unshift(notif);
    }
  }
}

export async function dbGetComments(postId?: string): Promise<GroupComment[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    let query = "SELECT * FROM comments";
    let params: any[] = [];
    if (postId) {
      query = "SELECT * FROM comments WHERE post_id = $1";
      params = [postId];
    }
    const res = await p.query(query, params);
    return res.rows.map(row => ({
      id: row.id,
      postId: row.post_id,
      authorAlias: row.author_alias,
      content: row.content,
      timestamp: row.timestamp
    }));
  }
  if (postId) {
    return md.comments.filter(c => c.postId === postId);
  }
  return md.comments;
}

export async function dbAddComment(comment: GroupComment): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query(
      `INSERT INTO comments (id, post_id, author_alias, content, timestamp) 
       VALUES ($1, $2, $3, $4, $5)`,
      [comment.id, comment.postId, comment.authorAlias, comment.content, comment.timestamp]
    );
    await p.query("UPDATE posts SET comments_count = comments_count + 1 WHERE id = $1", [comment.postId]);
    return;
  }
  md.comments.push(comment);
  const post = md.posts.find(pos => pos.id === comment.postId);
  if (post) {
    post.commentsCount += 1;
  }
}

export async function dbDeleteComment(commentId: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const commentRes = await p.query("SELECT post_id FROM comments WHERE id = $1", [commentId]);
    if (commentRes.rowCount && commentRes.rowCount > 0) {
      const pId = commentRes.rows[0].post_id;
      await p.query("DELETE FROM comments WHERE id = $1", [commentId]);
      await p.query("UPDATE posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = $1", [pId]);
    }
    await dbLogAudit("Delete Reply", `Moderator deleted comment/reply id=${commentId}`);
    return;
  }

  const comment = md.comments.find(c => c.id === commentId);
  if (comment) {
    const post = md.posts.find(pos => pos.id === comment.postId);
    if (post) {
      post.commentsCount = Math.max(0, post.commentsCount - 1);
    }
    md.comments = md.comments.filter(c => c.id !== commentId);
  }
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Delete Comment",
    details: `Moderator deleted comment id=${commentId} in-memory.`,
    timestamp: new Date().toISOString()
  });
}

// Admin Audit Logging Function
export async function dbLogAudit(action: string, details: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("INSERT INTO admin_audits (action, details) VALUES ($1, $2)", [action, details]);
    return;
  }
  md.audits.unshift({
    id: md.audits.length + 1,
    action,
    details,
    timestamp: new Date().toISOString()
  });
}

export async function dbGetAudits(): Promise<any[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const res = await p.query("SELECT * FROM admin_audits ORDER BY id DESC LIMIT 50");
    return res.rows;
  }
  return md.audits;
}

// === MEDICATION DATA SERVICES ===
export async function dbGetMedications(): Promise<Medication[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const res = await p.query("SELECT * FROM medications ORDER BY name_en ASC");
    return res.rows.map(row => ({
      id: row.id,
      nameEn: row.name_en,
      nameFr: row.name_fr,
      usageEn: row.usage_en,
      usageFr: row.usage_fr,
      dosageEn: row.dosage_en,
      dosageFr: row.dosage_fr,
      sideEffectsEn: row.side_effects_en,
      sideEffectsFr: row.side_effects_fr,
      warningsEn: row.warnings_en,
      warningsFr: row.warnings_fr,
      category: row.category
    }));
  }
  return md.medications;
}

export async function dbUpsertMedication(med: Medication): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query(
      `INSERT INTO medications (id, name_en, name_fr, usage_en, usage_fr, dosage_en, dosage_fr, side_effects_en, side_effects_fr, warnings_en, warnings_fr, category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       ON CONFLICT (id) DO UPDATE SET
         name_en = EXCLUDED.name_en,
         name_fr = EXCLUDED.name_fr,
         usage_en = EXCLUDED.usage_en,
         usage_fr = EXCLUDED.usage_fr,
         dosage_en = EXCLUDED.dosage_en,
         dosage_fr = EXCLUDED.dosage_fr,
         side_effects_en = EXCLUDED.side_effects_en,
         side_effects_fr = EXCLUDED.side_effects_fr,
         warnings_en = EXCLUDED.warnings_en,
         warnings_fr = EXCLUDED.warnings_fr,
         category = EXCLUDED.category`,
      [med.id, med.nameEn, med.nameFr, med.usageEn, med.usageFr, med.dosageEn, med.dosageFr, med.sideEffectsEn, med.sideEffectsFr, med.warningsEn, med.warningsFr, med.category]
    );
    await dbLogAudit("Upsert Medication", `Medication id=${med.id} was created or edited.`);
    return;
  }

  const idx = md.medications.findIndex(m => m.id === med.id);
  if (idx !== -1) {
    md.medications[idx] = med;
  } else {
    md.medications.push(med);
  }
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Upsert Medication",
    details: `Medication id=${med.id} was configured in-memory.`,
    timestamp: new Date().toISOString()
  });
}

export async function dbDeleteMedication(id: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("DELETE FROM medications WHERE id = $1", [id]);
    await dbLogAudit("Delete Medication", `Medication id=${id} was deleted of records.`);
    return;
  }

  md.medications = md.medications.filter(m => m.id !== id);
  md.audits.unshift({
    id: md.audits.length + 1,
    action: "Delete Medication",
    details: `Medication id=${id} was removed in-memory.`,
    timestamp: new Date().toISOString()
  });
}

// === PRIVATE MESSAGING SERVICES ===
export async function dbGetPrivateMessages(alias1: string, alias2: string): Promise<PrivateMessage[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  const c1 = `${alias1}_${alias2}`;
  const c2 = `${alias2}_${alias1}`;

  if (ip && p) {
    const res = await p.query(
      `SELECT * FROM private_messages 
       WHERE chat_id = $1 OR chat_id = $2 
       ORDER BY id ASC`, 
      [c1, c2]
    );
    return res.rows.map(row => ({
      id: row.id,
      chatId: row.chat_id,
      senderAlias: row.sender_alias,
      recipientAlias: row.recipient_alias,
      content: row.content,
      timestamp: row.timestamp,
      mediaUrl: row.media_url
    }));
  }

  return md.privateMessages.filter(
    m => (m.chatId === c1 || m.chatId === c2)
  );
}

export async function dbAddPrivateMessage(msg: PrivateMessage): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  
  // Check user blockage before completing payload delivery to satisfy SRS Requirements 3.7
  const isBlocked = await dbCheckUserBlocked(msg.recipientAlias, msg.senderAlias);
  if (isBlocked) {
    throw new Error("Target user blocked direct messaging from this account.");
  }

  if (ip && p) {
    await p.query(
      `INSERT INTO private_messages (id, chat_id, sender_alias, recipient_alias, content, timestamp, media_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [msg.id, msg.chatId, msg.senderAlias, msg.recipientAlias, msg.content, msg.timestamp, msg.mediaUrl]
    );
    return;
  }

  md.privateMessages.push(msg);
}

export async function dbGetDirectChats(alias: string): Promise<DirectChat[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  
  if (ip && p) {
    const res = await p.query(
      `SELECT DISTINCT ON (chat_id) 
         chat_id, sender_alias, recipient_alias, content, timestamp 
       FROM private_messages 
       WHERE sender_alias = $1 OR recipient_alias = $1 
       ORDER BY chat_id, id DESC`,
      [alias]
    );
    return res.rows.map(row => {
      const peer = row.sender_alias === alias ? row.recipient_alias : row.sender_alias;
      return {
        id: row.chat_id,
        peerAlias: peer,
        lastMessage: row.content,
        timestamp: row.timestamp
      };
    });
  }

  // In memory computation
  const matches = md.privateMessages.filter(
    m => m.senderAlias === alias || m.recipientAlias === alias
  );
  
  const chatGroups: { [key: string]: PrivateMessage } = {};
  for (const m of matches) {
    const existing = chatGroups[m.chatId];
    if (!existing || parseInt(m.id) > parseInt(existing.id)) {
      chatGroups[m.chatId] = m;
    }
  }

  return Object.values(chatGroups).map(row => {
    const peer = row.senderAlias === alias ? row.recipientAlias : row.senderAlias;
    return {
      id: row.chatId,
      peerAlias: peer,
      lastMessage: row.content,
      timestamp: row.timestamp
    };
  });
}

// === AUTHENTICATION SERVICES ===
export async function dbGetUser(username: string) {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  const lowerUsername = username.trim().toLowerCase();
  
  if (lowerUsername === "admin") {
    return {
      username: "admin",
      password: "admin123",
      anonymousAlias: "Administrator"
    };
  }
  
  if (ip && p) {
    const res = await p.query("SELECT * FROM app_users WHERE LOWER(username) = $1", [lowerUsername]);
    if (res.rowCount && res.rowCount > 0) {
      return {
        username: res.rows[0].username,
        password: res.rows[0].password,
        anonymousAlias: res.rows[0].anonymous_alias
      };
    }
    return null;
  }
  
  const found = md.users.find(u => u.username.toLowerCase() === lowerUsername);
  return found || null;
}

export async function dbAddUser(username: string, password: string, anonymousAlias: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  const trimmedUsername = username.trim();
  const trimmedAlias = anonymousAlias.trim();
  
  if (ip && p) {
    await p.query(
      "INSERT INTO app_users (username, password, anonymous_alias) VALUES ($1, $2, $3)",
      [trimmedUsername, password, trimmedAlias]
    );
  } else {
    md.users.push({ username: trimmedUsername, password, anonymousAlias: trimmedAlias });
  }

  await dbLogAudit(
    "User Registration", 
    `Registered user "${trimmedUsername}" with safe anonymous pseudonym "${trimmedAlias}".`
  );
}

// === BLOCKS & REPORTING SERVICES ===
export async function dbAddUserBlock(blocking: string, blocked: string): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    // Avoid double entry
    const checkObj = await p.query("SELECT * FROM user_blocks WHERE blocking_alias = $1 AND blocked_alias = $2", [blocking, blocked]);
    if (checkObj.rowCount === 0) {
      await p.query("INSERT INTO user_blocks (blocking_alias, blocked_alias) VALUES ($1, $2)", [blocking, blocked]);
    }
    return;
  }

  const already = md.blockedUsers.some(b => b.blocking === blocking && b.blocked === blocked);
  if (!already) {
    md.blockedUsers.push({ blocking, blocked });
  }
}

export async function dbCheckUserBlocked(recipient: string, sender: string): Promise<boolean> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const check = await p.query(
      "SELECT * FROM user_blocks WHERE blocking_alias = $1 AND blocked_alias = $2", 
      [recipient, sender]
    );
    return (check.rowCount ?? 0) > 0;
  }
  return md.blockedUsers.some(b => b.blocking === recipient && b.blocked === sender);
}

// === NOTIFICATION SERVICES ===
export async function dbGetNotifications(): Promise<AppNotification[]> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    const res = await p.query("SELECT * FROM app_notifications ORDER BY id DESC");
    return res.rows.map(row => ({
      id: row.id,
      titleEn: row.title_en,
      titleFr: row.title_fr,
      contentEn: row.content_en,
      contentFr: row.content_fr,
      timestamp: row.timestamp,
      isRead: row.is_read
    }));
  }
  return md.notifications;
}

export async function dbAddNotification(notif: AppNotification): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query(
      `INSERT INTO app_notifications (id, title_en, title_fr, content_en, content_fr, timestamp, is_read) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [notif.id, notif.titleEn, notif.titleFr, notif.contentEn, notif.contentFr, notif.timestamp, notif.isRead]
    );
    return;
  }
  md.notifications.unshift(notif);
}

export async function dbMarkNotificationsRead(): Promise<void> {
  const { pool: p, isPostgres: ip, memoryDb: md } = await getDb();
  if (ip && p) {
    await p.query("UPDATE app_notifications SET is_read = TRUE");
    return;
  }
  md.notifications.forEach(n => n.isRead = true);
}


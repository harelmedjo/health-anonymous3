import { Condition, GroupPost, GroupComment } from "./types";

export const CONDITIONS: Condition[] = [
  {
    id: "diabetes",
    nameEn: "Type 2 Diabetes",
    nameFr: "Diabète de type 2",
    category: "Chronic",
    descriptionEn: "A chronic condition that affects the way the body processes blood sugar (glucose). Common symptoms include increased thirst and frequent urination.",
    descriptionFr: "Une affection chronique qui alterne la façon dont le corps traite le sucre dans le sang (glucose). Les symptômes fréquents comprennent une soif accrue et des mictions fréquentes.",
    membersCount: "12.4k",
    resourcesCountEn: "85 Research Papers",
    resourcesCountFr: "85 Articles de recherche",
    icon: "pulmonology"
  },
  {
    id: "anxiety",
    nameEn: "General Anxiety Disorder",
    nameFr: "Trouble d'Anxiété Généralisée",
    category: "Mental Health",
    descriptionEn: "Severe, ongoing anxiety that interferes with daily activities. People with GAD may worry excessively about ordinary things.",
    descriptionFr: "Anxiété grave et persistante qui interfère avec les activités quotidiennes. Les personnes atteintes de TAG peuvent s'inquiéter excessivement pour des choses ordinaires.",
    membersCount: "45.2k",
    resourcesCountEn: "120 Community Guides",
    resourcesCountFr: "120 Guides communautaires",
    icon: "psychiatry"
  },
  {
    id: "long_covid",
    nameEn: "Long COVID Syndrome",
    nameFr: "Syndrome de COVID Long",
    category: "Infectious",
    descriptionEn: "A variety of new, returning, or ongoing health problems that people experience more than four weeks after getting COVID-19.",
    descriptionFr: "Une variété de problèmes de santé nouveaux, récurrents ou persistants que les gens éprouvent plus de quatre semaines après avoir contracté la COVID-19.",
    membersCount: "8.9k",
    resourcesCountEn: "210 Medical Journals",
    resourcesCountFr: "210 Revues médicales",
    icon: "coronavirus"
  },
  {
    id: "celiac",
    nameEn: "Celiac Disease",
    nameFr: "Maladie Coeliaque",
    category: "Autoimmune",
    descriptionEn: "An autoimmune disorder where eating gluten leads to damage in the small intestine. Regarded as a serious genetic autoimmune disease.",
    descriptionFr: "Un trouble auto-immunitaire où la consommation de gluten entraîne des dommages dans l'intestin grêle. Considérée comme une maladie génétique grave.",
    membersCount: "5.1k",
    resourcesCountEn: "94 Dietitian Studies",
    resourcesCountFr: "94 Études de diététistes",
    icon: "nutrition"
  },
  {
    id: "crohns",
    nameEn: "Crohn's Disease",
    nameFr: "Maladie de Crohn",
    category: "Autoimmune",
    descriptionEn: "A chronic inflammatory bowel disease (IBD) characterized by inflammation of the digestive, gastrointestinal tract.",
    descriptionFr: "Une maladie inflammatoire chronique de l'intestin (MICI) caractérisée par une inflammation du tractus digestif et gastro-intestinal.",
    membersCount: "7.3k",
    resourcesCountEn: "140 Clinical Trials",
    resourcesCountFr: "140 Essais cliniques",
    icon: "gastroenterology"
  },
  {
    id: "fibromyalgia",
    nameEn: "Fibromyalgia",
    nameFr: "Fibromyalgie",
    category: "Chronic",
    descriptionEn: "A disorder characterized by widespread musculoskeletal pain accompanied by fatigue, sleep, memory, and mood issues.",
    descriptionFr: "Un trouble caractérisé par une douleur musculo-squelettique généralisée accompagnée de fatigue, de troubles du sommeil, de mémoire et d'humeur.",
    membersCount: "19.6k",
    resourcesCountEn: "105 Expert Opinions",
    resourcesCountFr: "105 Avis d'experts",
    icon: "neurology"
  }
];

export const INITIAL_GROUP_POSTS: GroupPost[] = [
  {
    id: "p1",
    conditionId: "diabetes",
    authorAlias: "GentleWillow25",
    content: "Has anyone successfully managed their A1C level just with resistance training and nutritional changes? I was diagnosed yesterday and feel a bit overwhelmed but really want to try non-pharmacological routes first.",
    timestamp: "2 hours ago",
    likes: 18,
    commentsCount: 3
  },
  {
    id: "p2",
    conditionId: "anxiety",
    authorAlias: "CalmOak99",
    content: "Grounding exercises have been a lifesaver for me during panic attacks. The 5-4-3-2-1 method really helps bring me back to earth. What works best for you guys when you feel a wave of panic setting in?",
    timestamp: "5 hours ago",
    likes: 34,
    commentsCount: 4
  },
  {
    id: "p3",
    conditionId: "long_covid",
    authorAlias: "ResilientPanda12",
    content: "Almost a year post-infection and I'm finally starting to see improvements in brain fog. Pace yourself, sleep as much as your body cries for, and don't push through physical boundaries! It does get better slowly.",
    timestamp: "1 day ago",
    likes: 56,
    commentsCount: 5
  }
];

export const INITIAL_GROUP_COMMENTS: GroupComment[] = [
  {
    id: "c1",
    postId: "p1",
    authorAlias: "MindfulDolphin44",
    content: "Yes! Resistance training (3x a week) combined with keeping my carbohydrate intake consistent helped drop my A1C from 7.1 to 5.8 in about six months. You can do this!",
    timestamp: "1 hour ago"
  },
  {
    id: "c2",
    postId: "p1",
    authorAlias: "HealthyRiver18",
    content: "Be gentle with yourself. Overwhelmed is completely normal at the start. Resistance training is incredible because muscle tissue absorbs glucose even without insulin during work!",
    timestamp: "30 mins ago"
  },
  {
    id: "c3",
    postId: "p2",
    authorAlias: "StrongSparrow02",
    content: "For me, box breathing (4 in, 4 hold, 4 out, 4 hold) resets my central nervous system. I count on my fingers to focus the physical mind.",
    timestamp: "4 hours ago"
  }
];

export const ALIAS_ADJECTIVES = [
  "Resilient", "Hopeful", "Gentle", "Courageous", "Calm", 
  "Peaceful", "Strong", "Optimistic", "Graceful", "Mindful",
  "Warm", "Sincere", "Balanced", "Empowered", "Kind"
];

export const ALIAS_NOUNS = [
  "Healer", "Warrior", "Oak", "Panda", "Sun", 
  "River", "Willow", "Breeze", "Dolphin", "Sparrow",
  "Lantern", "Feather", "Sentry", "Shelter", "Pebble"
];

export function generateAnonymousAlias(): string {
  const adj = ALIAS_ADJECTIVES[Math.floor(Math.random() * ALIAS_ADJECTIVES.length)];
  const noun = ALIAS_NOUNS[Math.floor(Math.random() * ALIAS_NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10;
  return `${adj}${noun}${num}`;
}

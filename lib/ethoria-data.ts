// Real Ethoria world data from the repository
export const ETHORIA_WORLD = {
  name: "Ethoria",
  description: "Ethoria is a realm of seven kingdoms, each founded on a distinct moral principle: Courage, Wisdom, Compassion, Justice, Honesty, Perseverance, and Forgiveness. These virtues are woven into the fabric of society, guiding the actions of rulers and citizens alike. The kingdoms' architecture, laws, and even magical energies are attuned to their respective principles, creating a world where morality is a tangible force that shapes the destiny of its inhabitants.",
  
  kingdoms: {
    Valdor: {
      name: "Valdor",
      description: "Valdor, the Kingdom of Courage, is a realm of fearless warriors and daring explorers. Led by the fearless Queen Lyra, Valdor's people are bred for battle, with a history of conquering untamed lands and taming the unknown. Their capital, the fortress city of Krael, is a marvel of defensive architecture, with walls that shimmer with a magical aura of bravery.",
      
      towns: {
        Ravenhurst: {
          name: "Ravenhurst",
          description: "Nestled in the dark, misty forests of Valdor's north, Ravenhurst is a foreboding town of skilled hunters and trappers. The town's wooden buildings seem to blend seamlessly into the surrounding trees, and its people are masters of stealth and tracking. Ravenhurst's history is shrouded in mystery, with whispers of ancient pacts with the forest's mysterious creatures.",
          
          npcs: {
            "Elara Brightshield": {
              name: "Elara Brightshield",
              description: "Elara is a sturdy, blonde-haired warrior with a warm smile and a suit of shining silver armor adorned with the emblem of Valdor. As a member of the Queen's personal guard, Elara is sworn to defend the kingdom and its people with her life. Yet, she secretly struggles with the weight of her responsibilities and the pressure to live up to her family's legacy of bravery, all while longing for a sense of freedom and autonomy."
            },
            "Kael Darkhunter": {
              name: "Kael Darkhunter", 
              description: "Kael is a tall, lean figure with piercing green eyes and jet-black hair, often dressed in dark leather armor and carrying an enchanted longbow. As a skilled hunter and tracker from Ravenhurst, Kael has earned a reputation for being able to find and eliminate any target. However, beneath their stoic exterior lies a deep-seated fear of failure and a burning desire to prove themselves as more than just a tool for the kingdom's bidding."
            },
            "Cormac Stonefist": {
              name: "Cormac Stonefist",
              description: "Cormac is a gruff, rugged man with a thick beard and a missing eye, often clad in worn, earth-toned robes. As a master stonemason and architect, Cormac has spent years honing his craft in the service of Valdor, designing and building structures that embody the kingdom's values of courage and strength. However, Cormac's rough exterior hides a deep sense of loss and regret, stemming from a tragic accident that cost him his eye and his sense of purpose."
            }
          }
        }
      }
    }
  },

  startingScenario: "You are Elara Brightshield, a sturdy, blonde-haired warrior with a warm smile and a suit of shining silver armor adorned with the emblem of Valdor. You stand tall, your armor gleaming in the dim light of Ravenhurst's misty forest surroundings. You feel the weight of your responsibilities as a member of the Queen's personal guard, sworn to defend the kingdom and its people with your life. Yet, beneath your confident exterior, you struggle with the pressure to live up to your family's legacy of bravery, all while longing for a sense of freedom and autonomy. You gaze out at the dark, misty forest, wondering what secrets lie hidden in the shadows."
};

export const STARTING_PLAYER = {
  name: "Elara Brightshield",
  health: 100,
  maxHealth: 100,
  level: 1,
  exp: 0,
  expToLevel: 100,
  position: [0, 0] as [number, number],
  inventory: {
    "cloth pants": 1,
    "cloth shirt": 1,
    "goggles": 1,
    "leather bound journal": 1,
    "gold": 5
  },
  skills: {
    combat: 1,
    stealth: 1,
    magic: 1
  },
  currentQuest: null,
  completedQuests: [],
  reputation: { Valdor: 0, Ravenhurst: 0 }
};

export const STARTING_LOCATION = {
  kingdom: "Valdor",
  town: "Ravenhurst",
  area: "The misty forests surrounding Ravenhurst"
};
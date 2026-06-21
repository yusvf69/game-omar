import { db, pool } from "@workspace/db";
import {
  gamesTable,
  usersTable,
  subscriptionPlansTable,
  subscriptionsTable,
  reviewsTable,
  wishlistTable,
  achievementsTable,
  userAchievementsTable,
  marketplaceItemsTable,
  userMarketplaceItemsTable,
  tournamentsTable,
  tournamentParticipantsTable,
  friendshipsTable,
  messagesTable,
  eventsTable,
  voiceRoomsTable,
  voiceRoomMembersTable,
  notificationsTable,
  guildsTable,
  guildMembersTable,
  partiesTable,
  partyMembersTable,
} from "@workspace/db/schema";

async function seed() {
  console.log("🌱 Seeding database...");

    await pool.query(`
    TRUNCATE TABLE
      user_marketplace_items, marketplace_items,
      voice_room_members, voice_rooms,
      tournament_participants, tournaments,
      messages, friendships, events, notifications,
      guild_members, guilds,
      party_members, parties,
      user_achievements, achievements,
      wishlist, reviews,
      subscriptions, subscription_plans,
      games, users
    RESTART IDENTITY CASCADE
  `);

  const userIds = (
    await db
      .insert(usersTable)
      .values([
        {
          username: "shadowblade",
          email: "shadow@email.com",
          password: "hashed_password_placeholder",
          displayName: "Shadow Blade",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=shadow",
          bio: "Competitive gamer & streamer",
          country: "EG",
          level: 42,
          xp: 28450,
          role: "admin",
          subscriptionPlan: "vip",
        },
        {
          username: "neonrider",
          email: "neon@email.com",
          password: "hashed_password_placeholder",
          displayName: "Neon Rider",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=neon",
          bio: "Racing enthusiast, top 1% globally",
          country: "AE",
          level: 38,
          xp: 22100,
          role: "user",
          subscriptionPlan: "premium",
        },
        {
          username: "cyberphoenix",
          email: "phoenix@email.com",
          password: "hashed_password_placeholder",
          displayName: "Cyber Phoenix",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=phoenix",
          bio: "RPG lover, achievement hunter",
          country: "SA",
          level: 55,
          xp: 41200,
          role: "user",
          subscriptionPlan: "vip",
        },
        {
          username: "stormbreaker",
          email: "storm@email.com",
          password: "hashed_password_placeholder",
          displayName: "Storm Breaker",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=storm",
          bio: "Strategy game master",
          country: "US",
          level: 29,
          xp: 15300,
          role: "user",
          subscriptionPlan: "basic",
        },
        {
          username: "voidwalker",
          email: "void@email.com",
          password: "hashed_password_placeholder",
          displayName: "Void Walker",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=void",
          bio: "Indie game collector",
          country: "GB",
          level: 18,
          xp: 8900,
          role: "user",
          subscriptionPlan: "free",
        },
        {
          username: "archerqueen",
          email: "archer@email.com",
          password: "hashed_password_placeholder",
          displayName: "Archer Queen",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=archer",
          bio: "FPS competitive player",
          country: "CA",
          level: 47,
          xp: 35600,
          role: "moderator",
          subscriptionPlan: "premium",
        },
        {
          username: "frostbyte",
          email: "frost@email.com",
          password: "hashed_password_placeholder",
          displayName: "Frost Byte",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=frost",
          bio: "Puzzle solver & casual gamer",
          country: "DE",
          level: 12,
          xp: 5200,
          role: "user",
          subscriptionPlan: "free",
        },
        {
          username: "demouser",
          email: "demo@email.com",
          password: "hashed_password_placeholder",
          displayName: "Demo User",
          avatarUrl: "https://api.dicebear.com/9.x/avataaars/svg?seed=demo",
          bio: "Welcome to GamingOS!",
          country: "US",
          level: 24,
          xp: 12400,
          role: "user",
          subscriptionPlan: "basic",
        },
      ])
      .returning({ id: usersTable.id })
  ).map((u) => u.id);

  console.log(`✅ Created ${userIds.length} users`);

  const subscriptionPlanIds = (
    await db
      .insert(subscriptionPlansTable)
      .values([
        {
          name: "Free",
          slug: "free",
          monthlyPrice: "0",
          yearlyPrice: "0",
          features: [
            "Access to limited games",
            "Light ads",
            "Standard download speed",
            "Basic achievements",
          ],
          gamesAccess: "Limited",
          adsEnabled: "true",
          earlyAccess: "false",
          prioritySupport: "false",
          color: "#6b7280",
        },
        {
          name: "Basic",
          slug: "basic",
          monthlyPrice: "4.99",
          yearlyPrice: "39.99",
          features: [
            "More games unlocked",
            "No ads",
            "Cloud save (10 slots)",
            "Faster downloads",
            "Wishlist sync",
          ],
          gamesAccess: "Extended",
          adsEnabled: "false",
          earlyAccess: "false",
          prioritySupport: "false",
          color: "#34c759",
        },
        {
          name: "Premium",
          slug: "premium",
          monthlyPrice: "9.99",
          yearlyPrice: "79.99",
          features: [
            "Full game library access",
            "Unlimited cloud save",
            "All achievements",
            "Priority updates",
            "Early access games",
          ],
          gamesAccess: "All",
          adsEnabled: "false",
          earlyAccess: "true",
          prioritySupport: "false",
          color: "#007aff",
        },
        {
          name: "VIP",
          slug: "vip",
          monthlyPrice: "19.99",
          yearlyPrice: "179.99",
          features: [
            "Everything in Premium",
            "Beta access",
            "Exclusive games",
            "Exclusive skins & items",
            "Priority support",
            "Tournament entry perks",
          ],
          gamesAccess: "All + Exclusive",
          adsEnabled: "false",
          earlyAccess: "true",
          prioritySupport: "true",
          color: "#af52de",
        },
      ])
      .returning({ id: subscriptionPlansTable.id })
  ).map((p) => p.id);

  console.log(`✅ Created ${subscriptionPlanIds.length} subscription plans`);

  await db.insert(subscriptionsTable).values([
    { userId: userIds[0], plan: "vip", status: "active", billingCycle: "yearly", price: "179.99", startDate: "2025-01-15" },
    { userId: userIds[1], plan: "premium", status: "active", billingCycle: "monthly", price: "9.99", startDate: "2025-03-01" },
    { userId: userIds[2], plan: "vip", status: "active", billingCycle: "yearly", price: "179.99", startDate: "2024-11-20" },
    { userId: userIds[3], plan: "basic", status: "active", billingCycle: "monthly", price: "4.99", startDate: "2025-05-10" },
    { userId: userIds[4], plan: "free", status: "active", billingCycle: "monthly", price: "0", startDate: "2025-06-01" },
    { userId: userIds[5], plan: "premium", status: "active", billingCycle: "monthly", price: "9.99", startDate: "2025-02-14" },
    { userId: userIds[6], plan: "free", status: "active", billingCycle: "monthly", price: "0", startDate: "2025-06-10" },
    { userId: userIds[7], plan: "basic", status: "active", billingCycle: "monthly", price: "4.99", startDate: "2025-04-20" },
  ]);

  console.log(`✅ Created 8 subscriptions`);

  const gameIds = (
    await db
      .insert(gamesTable)
      .values([
        {
          title: "Cyber Arena",
          description: "Battle in a futuristic arena where cybernetic warriors fight for glory. Master your weapons, upgrade your gear, and climb the ranks in this fast-paced competitive shooter. Featuring 6 unique game modes, 20+ maps, and a deep progression system.",
          category: "Shooter",
          price: "0",
          rating: "4.8",
          reviewCount: 15234,
          downloads: 1250000,
          coverImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=800&q=80",
          trailerUrl: "https://www.youtube.com/watch?v=example1",
          screenshots: [
            "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=800&q=80",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
            "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
          ],
          developer: "Neon Studios",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: true,
          isTrending: true,
          releaseDate: "2024-03-15",
          tags: ["multiplayer", "fps", "competitive", "cyberpunk"],
          requirements: "OS: Windows 10, CPU: Intel i5, RAM: 8GB, GPU: GTX 1060",
        },
        {
          title: "Skyline Racer",
          description: "Experience the thrill of illegal street racing through neon-lit city streets at 300 km/h. Customize your cars, evade the police, and build your reputation as the ultimate street racer.",
          category: "Racing",
          price: "19.99",
          rating: "4.6",
          reviewCount: 8921,
          downloads: 890000,
          coverImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
          trailerUrl: "https://www.youtube.com/watch?v=example2",
          screenshots: [
            "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&q=80",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80",
          ],
          developer: "Turbo Digital",
          publisher: "GamingOS",
          subscriptionTier: "premium",
          isFeatured: true,
          isTrending: false,
          releaseDate: "2024-05-20",
          tags: ["racing", "multiplayer", "open-world", "cars"],
          requirements: "OS: Windows 10, CPU: Intel i7, RAM: 16GB, GPU: RTX 2060",
        },
        {
          title: "Pixel Kingdoms",
          description: "Build and manage your medieval kingdom in this charming pixel-art strategy game. Gather resources, train armies, forge alliances, and conquer your enemies in epic real-time battles.",
          category: "Strategy",
          price: "14.99",
          rating: "4.4",
          reviewCount: 12450,
          downloads: 2100000,
          coverImage: "https://images.unsplash.com/photo-1611996575749-79a3a250f949?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1611996575749-79a3a250f949?w=800&q=80",
            "https://images.unsplash.com/photo-1567593810070-7a3f3b4d1c4d?w=800&q=80",
          ],
          developer: "Pixel Forge",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: false,
          isTrending: true,
          releaseDate: "2023-11-01",
          tags: ["strategy", "pixel-art", "single-player", "building"],
          requirements: "OS: Windows 7, CPU: Intel i3, RAM: 4GB",
        },
        {
          title: "Dragon's Quest",
          description: "An epic RPG adventure where you explore a vast fantasy world, battle mythical creatures, and uncover ancient secrets. Forge your own path with deep character customization and a branching storyline.",
          category: "RPG",
          price: "29.99",
          rating: "4.9",
          reviewCount: 28100,
          downloads: 3400000,
          coverImage: "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=800&q=80",
          trailerUrl: "https://www.youtube.com/watch?v=example4",
          screenshots: [
            "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=800&q=80",
            "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80",
          ],
          developer: "Epic Tale Games",
          publisher: "GamingOS",
          subscriptionTier: "premium",
          isFeatured: true,
          isTrending: true,
          releaseDate: "2024-08-10",
          tags: ["rpg", "open-world", "fantasy", "single-player", "story-rich"],
          requirements: "OS: Windows 10, CPU: Intel i7, RAM: 16GB, GPU: RTX 3070",
        },
        {
          title: "Horizon Protocol",
          description: "A tactical stealth game set in a dystopian future. As an elite agent, infiltrate high-security facilities, hack systems, and uncover a global conspiracy. Every choice matters.",
          category: "Action",
          price: "24.99",
          rating: "4.7",
          reviewCount: 6780,
          downloads: 780000,
          coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
          ],
          developer: "Shadow Ops",
          publisher: "GamingOS",
          subscriptionTier: "basic",
          isFeatured: false,
          isTrending: false,
          releaseDate: "2024-01-25",
          tags: ["action", "stealth", "tactical", "sci-fi"],
          requirements: "OS: Windows 10, CPU: Intel i5, RAM: 8GB, GPU: GTX 1060",
        },
        {
          title: "Fruit Bash",
          description: "The ultimate casual fruit-slicing experience! Slice, dice, and combo your way through hundreds of levels. Perfect for quick gaming sessions with friends.",
          category: "Casual",
          price: "0",
          rating: "4.2",
          reviewCount: 45300,
          downloads: 8900000,
          coverImage: "https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?w=800&q=80",
          ],
          developer: "Casual Labs",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: false,
          isTrending: false,
          releaseDate: "2023-06-15",
          tags: ["casual", "arcade", "multiplayer", "family"],
          requirements: "OS: Windows 7, CPU: Intel i3, RAM: 2GB",
        },
        {
          title: "Night Ops",
          description: "A tense survival horror game where you must escape an abandoned facility infested with unknown creatures. Limited resources, terrifying enemies, and an atmospheric world await.",
          category: "Horror",
          price: "34.99",
          rating: "4.5",
          reviewCount: 12300,
          downloads: 1450000,
          coverImage: "https://images.unsplash.com/photo-1509248961158-c54f6936d5a4?w=800&q=80",
          trailerUrl: "https://www.youtube.com/watch?v=example7",
          screenshots: [
            "https://images.unsplash.com/photo-1509248961158-c54f6936d5a4?w=800&q=80",
            "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80",
          ],
          developer: "Dark Horizon",
          publisher: "GamingOS",
          subscriptionTier: "premium",
          isFeatured: true,
          isTrending: false,
          releaseDate: "2024-10-05",
          tags: ["horror", "survival", "single-player", "atmospheric"],
          requirements: "OS: Windows 10, CPU: Intel i7, RAM: 16GB, GPU: RTX 2060",
        },
        {
          title: "Zuma Legends",
          description: "Match colorful balls in this addictive puzzle game. Travel through ancient temples, unlock powerful artifacts, and compete for the highest score in the world.",
          category: "Puzzle",
          price: "4.99",
          rating: "4.3",
          reviewCount: 32100,
          downloads: 5600000,
          coverImage: "https://images.unsplash.com/photo-1611558709790-7be66e0a6d7f?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1611558709790-7be66e0a6d7f?w=800&q=80",
          ],
          developer: "Puzzle Masters",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: false,
          isTrending: false,
          releaseDate: "2023-09-20",
          tags: ["puzzle", "casual", "single-player", "addictive"],
          requirements: "OS: Windows 7, CPU: Intel i3, RAM: 2GB",
        },
        {
          title: "Gridlock",
          description: "A multiplayer battle royale where 100 players fight to be the last standing in a massive urban grid. Build, loot, and shoot your way to victory.",
          category: "Shooter",
          price: "0",
          rating: "4.6",
          reviewCount: 56700,
          downloads: 12000000,
          coverImage: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
          trailerUrl: "https://www.youtube.com/watch?v=example9",
          screenshots: [
            "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
            "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=800&q=80",
          ],
          developer: "BattleForge",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: false,
          isTrending: true,
          releaseDate: "2024-06-01",
          tags: ["battle-royale", "multiplayer", "fps", "competitive"],
          requirements: "OS: Windows 10, CPU: Intel i5, RAM: 8GB, GPU: GTX 960",
        },
        {
          title: "Starlight Explorer",
          description: "Explore an infinite procedurally-generated universe. Discover new planets, build bases, trade with alien civilizations, and uncover the mysteries of the cosmos.",
          category: "Simulation",
          price: "39.99",
          rating: "4.7",
          reviewCount: 18900,
          downloads: 2300000,
          coverImage: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80",
            "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80",
          ],
          developer: "Cosmic Games",
          publisher: "GamingOS",
          subscriptionTier: "vip",
          isFeatured: true,
          isTrending: false,
          releaseDate: "2024-12-01",
          tags: ["simulation", "open-world", "space", "exploration", "building"],
          requirements: "OS: Windows 10, CPU: Intel i7, RAM: 16GB, GPU: RTX 3060",
        },
        {
          title: "Beat Brawl",
          description: "A rhythm fighting game where you battle to the beat. Punch, kick, and combo in sync with the music. Features 50+ tracks and online multiplayer.",
          category: "Action",
          price: "14.99",
          rating: "4.4",
          reviewCount: 8900,
          downloads: 1200000,
          coverImage: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&q=80",
          ],
          developer: "Rhythm Interactive",
          publisher: "GamingOS",
          subscriptionTier: "basic",
          isFeatured: false,
          isTrending: false,
          releaseDate: "2024-04-15",
          tags: ["action", "rhythm", "multiplayer", "music", "fighting"],
          requirements: "OS: Windows 10, CPU: Intel i5, RAM: 8GB",
        },
        {
          title: "Soccer Stars 2025",
          description: "The most realistic soccer simulation on mobile. Build your ultimate team, compete in leagues, and rise to become a global champion.",
          category: "Sports",
          price: "0",
          rating: "4.5",
          reviewCount: 42300,
          downloads: 15000000,
          coverImage: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
          screenshots: [
            "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80",
          ],
          developer: "SportTech",
          publisher: "GamingOS",
          subscriptionTier: "free",
          isFeatured: false,
          isTrending: true,
          releaseDate: "2024-09-01",
          tags: ["sports", "soccer", "multiplayer", "competitive"],
          requirements: "OS: Windows 8, CPU: Intel i5, RAM: 4GB",
        },
      ])
      .returning({ id: gamesTable.id })
  ).map((g) => g.id);

  console.log(`✅ Created ${gameIds.length} games`);

  await db.insert(reviewsTable).values([
    { gameId: gameIds[0], userId: userIds[1], rating: 5, content: "Absolutely incredible! The graphics are stunning and the gameplay is silky smooth. Best FPS I've played in years. The ranking system keeps me coming back every day." },
    { gameId: gameIds[0], userId: userIds[2], rating: 4, content: "Great game but matchmaking can be slow sometimes. The weapon variety is amazing though!" },
    { gameId: gameIds[0], userId: userIds[5], rating: 5, content: "Finally a competitive shooter that feels fair. The anti-cheat system works well." },
    { gameId: gameIds[1], userId: userIds[0], rating: 5, content: "Best racing game on the platform. The car customization is insane!" },
    { gameId: gameIds[1], userId: userIds[6], rating: 4, content: "Really fun but needs more tracks. Love the night racing vibes though." },
    { gameId: gameIds[2], userId: userIds[3], rating: 5, content: "As a strategy game fan, this is pure gold. Deep mechanics with a charming art style." },
    { gameId: gameIds[2], userId: userIds[4], rating: 4, content: "Really addictive! The pixel art is beautiful and the gameplay loop is satisfying." },
    { gameId: gameIds[3], userId: userIds[2], rating: 5, content: "This is the RPG I've been waiting for. The story is deep, the world is beautiful, and the choices actually matter. 100+ hours and still not bored." },
    { gameId: gameIds[3], userId: userIds[0], rating: 5, content: "A masterpiece. The character customization alone is worth the price. Must-play for RPG fans." },
    { gameId: gameIds[3], userId: userIds[4], rating: 4, content: "Amazing world and story. Some side quests feel repetitive but the main quest is incredible." },
    { gameId: gameIds[4], userId: userIds[5], rating: 5, content: "Tense, thrilling, and incredibly well-designed. The stealth mechanics are best in class." },
    { gameId: gameIds[5], userId: userIds[7], rating: 4, content: "Perfect for quick gaming sessions! My whole family loves this game." },
    { gameId: gameIds[6], userId: userIds[1], rating: 5, content: "Scariest game I've ever played. The atmosphere is unmatched. Play with headphones!" },
    { gameId: gameIds[6], userId: userIds[2], rating: 4, content: "Terrifying and beautiful. The sound design is incredible. A bit short but worth every penny." },
    { gameId: gameIds[8], userId: userIds[0], rating: 5, content: "The best battle royale right now. Fast paced, great gunplay, and constant updates." },
    { gameId: gameIds[8], userId: userIds[5], rating: 4, content: "Really polished BR. The building mechanic adds a unique twist. Needs more map variety." },
    { gameId: gameIds[9], userId: userIds[2], rating: 5, content: "Starlight Explorer is a dream come true. I've spent hours just exploring beautiful planets." },
    { gameId: gameIds[9], userId: userIds[3], rating: 5, content: "The scale of this game is mind-blowing. Every planet feels unique and worth exploring." },
    { gameId: gameIds[10], userId: userIds[7], rating: 4, content: "Such a creative concept! Fighting to the music feels amazing. Needs more songs though." },
    { gameId: gameIds[11], userId: userIds[1], rating: 5, content: "Best soccer game on mobile. The controls are intuitive and the career mode is deep." },
  ]);

  console.log(`✅ Created 20 reviews`);

  await db.insert(wishlistTable).values([
    { userId: userIds[7], gameId: gameIds[1] },
    { userId: userIds[7], gameId: gameIds[3] },
    { userId: userIds[7], gameId: gameIds[6] },
    { userId: userIds[0], gameId: gameIds[9] },
    { userId: userIds[4], gameId: gameIds[3] },
    { userId: userIds[4], gameId: gameIds[9] },
    { userId: userIds[5], gameId: gameIds[0] },
    { userId: userIds[5], gameId: gameIds[8] },
  ]);

  console.log(`✅ Created 8 wishlist entries`);

  const achievementIds = (
    await db
      .insert(achievementsTable)
      .values([
        { gameId: gameIds[0], name: "First Blood", description: "Get your first kill in Cyber Arena", iconUrl: "🏆", xpReward: 100, rarity: "common" },
        { gameId: gameIds[0], name: "Headshot Master", description: "Get 100 headshots", iconUrl: "🎯", xpReward: 500, rarity: "rare" },
        { gameId: gameIds[0], name: "Win Streak", description: "Win 10 matches in a row", iconUrl: "🔥", xpReward: 1000, rarity: "epic" },
        { gameId: gameIds[0], name: "Legend Status", description: "Reach rank #1 on the leaderboard", iconUrl: "👑", xpReward: 5000, rarity: "legendary" },
        { gameId: gameIds[1], name: "Speed Demon", description: "Reach 350 km/h in Skyline Racer", iconUrl: "⚡", xpReward: 150, rarity: "common" },
        { gameId: gameIds[1], name: "Undefeated", description: "Win 50 street races", iconUrl: "🏁", xpReward: 750, rarity: "rare" },
        { gameId: gameIds[1], name: "Car Collector", description: "Own all cars in the game", iconUrl: "🚗", xpReward: 2000, rarity: "epic" },
        { gameId: gameIds[2], name: "Rising Kingdom", description: "Reach population 10,000 in Pixel Kingdoms", iconUrl: "🏰", xpReward: 100, rarity: "common" },
        { gameId: gameIds[2], name: "Conqueror", description: "Win 100 battles", iconUrl: "⚔️", xpReward: 500, rarity: "rare" },
        { gameId: gameIds[3], name: "Adventurer", description: "Complete 50 quests in Dragon's Quest", iconUrl: "🗺️", xpReward: 200, rarity: "common" },
        { gameId: gameIds[3], name: "Dragon Slayer", description: "Defeat the ancient dragon", iconUrl: "🐉", xpReward: 1500, rarity: "epic" },
        { gameId: gameIds[3], name: "Completionist", description: "100% complete Dragon's Quest", iconUrl: "💎", xpReward: 5000, rarity: "legendary" },
        { gameId: gameIds[6], name: "Survivor", description: "Survive the first night in Night Ops", iconUrl: "🌙", xpReward: 100, rarity: "common" },
        { gameId: gameIds[6], name: "Flashlight", description: "Complete the game without dying", iconUrl: "🔦", xpReward: 3000, rarity: "legendary" },
        { gameId: gameIds[8], name: "First Victory", description: "Win your first Battle Royale match", iconUrl: "🥇", xpReward: 200, rarity: "common" },
        { gameId: gameIds[8], name: "Royal Flush", description: "Get 10 kills in a single match", iconUrl: "♠️", xpReward: 500, rarity: "rare" },
        { gameId: gameIds[9], name: "First Contact", description: "Discover your first alien civilization", iconUrl: "👾", xpReward: 150, rarity: "common" },
        { name: "Social Butterfly", description: "Add 10 friends on GamingOS", iconUrl: "🦋", xpReward: 300, rarity: "common" },
        { name: "Reviewer", description: "Write 5 game reviews", iconUrl: "✍️", xpReward: 250, rarity: "common" },
        { name: "Game Collector", description: "Install 10 games", iconUrl: "📚", xpReward: 500, rarity: "rare" },
        { name: "Loyal Player", description: "Play for 100 hours total", iconUrl: "⏰", xpReward: 2000, rarity: "epic" },
        { name: "Premium Member", description: "Subscribe to Premium or VIP", iconUrl: "⭐", xpReward: 1000, rarity: "rare" },
      ])
      .returning({ id: achievementsTable.id })
  ).map((a) => a.id);

  console.log(`✅ Created ${achievementIds.length} achievements`);

  await db.insert(userAchievementsTable).values([
    { userId: userIds[0], achievementId: achievementIds[0] },
    { userId: userIds[0], achievementId: achievementIds[1] },
    { userId: userIds[0], achievementId: achievementIds[2] },
    { userId: userIds[0], achievementId: achievementIds[3] },
    { userId: userIds[0], achievementId: achievementIds[4] },
    { userId: userIds[0], achievementId: achievementIds[17] },
    { userId: userIds[0], achievementId: achievementIds[18] },
    { userId: userIds[0], achievementId: achievementIds[20] },
    { userId: userIds[0], achievementId: achievementIds[21] },
    { userId: userIds[1], achievementId: achievementIds[4] },
    { userId: userIds[1], achievementId: achievementIds[5] },
    { userId: userIds[1], achievementId: achievementIds[17] },
    { userId: userIds[1], achievementId: achievementIds[20] },
    { userId: userIds[2], achievementId: achievementIds[9] },
    { userId: userIds[2], achievementId: achievementIds[10] },
    { userId: userIds[2], achievementId: achievementIds[11] },
    { userId: userIds[2], achievementId: achievementIds[17] },
    { userId: userIds[2], achievementId: achievementIds[19] },
    { userId: userIds[2], achievementId: achievementIds[20] },
    { userId: userIds[2], achievementId: achievementIds[21] },
    { userId: userIds[3], achievementId: achievementIds[7] },
    { userId: userIds[3], achievementId: achievementIds[8] },
    { userId: userIds[3], achievementId: achievementIds[17] },
    { userId: userIds[4], achievementId: achievementIds[17] },
    { userId: userIds[5], achievementId: achievementIds[0] },
    { userId: userIds[5], achievementId: achievementIds[14] },
    { userId: userIds[5], achievementId: achievementIds[17] },
    { userId: userIds[5], achievementId: achievementIds[21] },
    { userId: userIds[7], achievementId: achievementIds[17] },
    { userId: userIds[7], achievementId: achievementIds[18] },
  ]);

  console.log(`✅ Created 30 user achievements`);

  const marketplaceItemIds = (
    await db
      .insert(marketplaceItemsTable)
      .values([
        { name: "Neon Blade Skin", description: "A cyberpunk-inspired blade with neon glow effects", type: "skin", rarity: "epic", price: "14.99", imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=200&q=80", gameId: gameIds[0] },
        { name: "Golden Dragon Armor", description: "Legendary armor set with dragon scale patterns", type: "skin", rarity: "legendary", price: "29.99", imageUrl: "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=200&q=80", gameId: gameIds[3] },
        { name: "100 GOS Coins", description: "100 premium currency coins", type: "currency", rarity: "common", price: "0.99", imageUrl: "https://images.unsplash.com/photo-1624462030291-2f04f3b280a6?w=200&q=80" },
        { name: "500 GOS Coins", description: "500 premium currency coins (best value)", type: "currency", rarity: "common", price: "3.99", imageUrl: "https://images.unsplash.com/photo-1624462030291-2f04f3b280a6?w=200&q=80" },
        { name: "1200 GOS Coins", description: "1200 premium currency coins", type: "currency", rarity: "rare", price: "9.99", imageUrl: "https://images.unsplash.com/photo-1624462030291-2f04f3b280a6?w=200&q=80" },
        { name: "Starter Bundle", description: "Contains 500 coins, 3 common skins, and 1 rare skin", type: "bundle", rarity: "rare", price: "14.99", imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80" },
        { name: "Premium Battle Pass", description: "Unlock exclusive rewards for the current season", type: "bundle", rarity: "epic", price: "19.99", imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&q=80" },
        { name: "Midnight Shadow Skin", description: "Stealth-themed skin with shadow particle effects", type: "skin", rarity: "rare", price: "9.99", imageUrl: "https://images.unsplash.com/photo-1509248961158-c54f6936d5a4?w=200&q=80", gameId: gameIds[4] },
        { name: "Pixel Hero Skin", description: "Retro pixel-art hero skin for Pixel Kingdoms", type: "skin", rarity: "rare", price: "7.99", imageUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f949?w=200&q=80", gameId: gameIds[2] },
        { name: "Cyberpunk Emote Pack", description: "5 exclusive cyberpunk-themed emotes", type: "cosmetics", rarity: "epic", price: "12.99", imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=200&q=80", gameId: gameIds[0] },
      ])
      .returning({ id: marketplaceItemsTable.id })
  ).map((m) => m.id);

  console.log(`✅ Created ${marketplaceItemIds.length} marketplace items`);

  const tournamentIds = (
    await db
      .insert(tournamentsTable)
      .values([
        { name: "Cyber Arena Daily Cup", description: "Daily 1v1 tournament - prove your skills!", gameId: gameIds[0], gameName: "Cyber Arena", type: "daily", status: "live", prizePool: "500", maxParticipants: 128, currentParticipants: 87, startDate: new Date(), endDate: new Date(Date.now() + 86400000), imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=400&q=80" },
        { name: "Gridlock Weekend Royale", description: "Weekend Battle Royale championship with huge prizes", gameId: gameIds[8], gameName: "Gridlock", type: "weekly", status: "live", prizePool: "2500", maxParticipants: 200, currentParticipants: 156, startDate: new Date(), endDate: new Date(Date.now() + 172800000), imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&q=80" },
        { name: "Skyline Racer Grand Prix", description: "Seasonal racing championship - top 3 win exclusive cars", gameId: gameIds[1], gameName: "Skyline Racer", type: "seasonal", status: "upcoming", prizePool: "10000", maxParticipants: 64, currentParticipants: 42, startDate: new Date(Date.now() + 604800000), endDate: new Date(Date.now() + 1209600000), imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&q=80" },
        { name: "Dragon's Quest Speedrun", description: "Who can complete Dragon's Quest the fastest?", gameId: gameIds[3], gameName: "Dragon's Quest", type: "weekly", status: "upcoming", prizePool: "5000", maxParticipants: 100, currentParticipants: 35, startDate: new Date(Date.now() + 259200000), endDate: new Date(Date.now() + 604800000), imageUrl: "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=400&q=80" },
        { name: "Beat Brawl Friday Fights", description: "Weekly rhythm fighting tournament", gameId: gameIds[10], gameName: "Beat Brawl", type: "weekly", status: "upcoming", prizePool: "1500", maxParticipants: 64, currentParticipants: 28, startDate: new Date(Date.now() + 432000000), endDate: new Date(Date.now() + 864000000), imageUrl: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&q=80" },
      ])
      .returning({ id: tournamentsTable.id })
  ).map((t) => t.id);

  console.log(`✅ Created ${tournamentIds.length} tournaments`);

  await db.insert(tournamentParticipantsTable).values([
    { tournamentId: tournamentIds[0], userId: userIds[0], rank: 1, score: 2500 },
    { tournamentId: tournamentIds[0], userId: userIds[1], rank: 5, score: 2100 },
    { tournamentId: tournamentIds[0], userId: userIds[2], rank: 12, score: 1800 },
    { tournamentId: tournamentIds[0], userId: userIds[5], rank: 3, score: 2350 },
    { tournamentId: tournamentIds[0], userId: userIds[7], rank: 28, score: 1200 },
    { tournamentId: tournamentIds[1], userId: userIds[0], rank: 2, score: 3400 },
    { tournamentId: tournamentIds[1], userId: userIds[5], rank: 1, score: 3600 },
    { tournamentId: tournamentIds[1], userId: userIds[7], rank: 15, score: 2000 },
    { tournamentId: tournamentIds[2], userId: userIds[1], rank: null, score: 0 },
    { tournamentId: tournamentIds[3], userId: userIds[2], rank: null, score: 0 },
  ]);

  console.log(`✅ Created 10 tournament participants`);

  await db.insert(friendshipsTable).values([
    { userId1: userIds[0], userId2: userIds[1], status: "accepted" },
    { userId1: userIds[0], userId2: userIds[2], status: "accepted" },
    { userId1: userIds[0], userId2: userIds[5], status: "accepted" },
    { userId1: userIds[1], userId2: userIds[2], status: "accepted" },
    { userId1: userIds[1], userId2: userIds[3], status: "accepted" },
    { userId1: userIds[2], userId2: userIds[3], status: "accepted" },
    { userId1: userIds[2], userId2: userIds[5], status: "accepted" },
    { userId1: userIds[5], userId2: userIds[0], status: "accepted" },
    { userId1: userIds[7], userId2: userIds[0], status: "pending" },
    { userId1: userIds[7], userId2: userIds[2], status: "pending" },
    { userId1: userIds[4], userId2: userIds[0], status: "accepted" },
  ]);

  console.log(`✅ Created 11 friendships`);

  await db.insert(messagesTable).values([
    { fromUserId: userIds[0], toUserId: userIds[1], content: "Hey! Want to play some Cyber Arena?" },
    { fromUserId: userIds[1], toUserId: userIds[0], content: "Sure! Give me 5 minutes" },
    { fromUserId: userIds[0], toUserId: userIds[2], content: "Nice achievement on Dragon's Quest!" },
    { fromUserId: userIds[2], toUserId: userIds[0], content: "Thanks man! Took me forever 😅" },
    { fromUserId: userIds[5], toUserId: userIds[0], content: "GG in the tournament today!" },
    { fromUserId: userIds[0], toUserId: userIds[5], content: "GG! You almost had me in the final round" },
    // Demo user conversations
    { fromUserId: userIds[7], toUserId: userIds[0], content: "Hey! How do I get started with Cyber Arena?" },
    { fromUserId: userIds[0], toUserId: userIds[7], content: "Just install it from the store and jump into training mode first" },
    { fromUserId: userIds[7], toUserId: userIds[1], content: "Nice profile! Love the avatar" },
    { fromUserId: userIds[1], toUserId: userIds[7], content: "Thanks! Yours is cool too 🔥" },
    { fromUserId: userIds[7], toUserId: userIds[5], content: "Want to team up for the weekend tournament?" },
    { fromUserId: userIds[5], toUserId: userIds[7], content: "Absolutely! I'll be online Saturday evening" },
  ]);

  console.log(`✅ Created 6 messages`);

  // ───── Voice Rooms ─────

  const [voiceRoom] = await db.insert(voiceRoomsTable).values({
    name: "General Chat",
    gameName: "Cyber Arena",
    hostId: userIds[0],
    maxMembers: 10,
  }).returning({ id: voiceRoomsTable.id });

  await db.insert(voiceRoomMembersTable).values([
    { roomId: voiceRoom.id, userId: userIds[0] },
    { roomId: voiceRoom.id, userId: userIds[1] },
    { roomId: voiceRoom.id, userId: userIds[5] },
    { roomId: voiceRoom.id, userId: userIds[7] },
  ]);

  const [voiceRoom2] = await db.insert(voiceRoomsTable).values({
    name: "RPG Talk",
    gameName: "Dragon's Quest",
    hostId: userIds[2],
    maxMembers: 8,
  }).returning({ id: voiceRoomsTable.id });

  await db.insert(voiceRoomMembersTable).values([
    { roomId: voiceRoom2.id, userId: userIds[2] },
    { roomId: voiceRoom2.id, userId: userIds[3] },
  ]);

  console.log(`✅ Created 2 voice rooms with 6 members`);

  // ───── Notifications ─────

  await db.insert(notificationsTable).values([
    { userId: userIds[7], type: "achievement", title: "Achievement Unlocked!", message: "You unlocked 'First Steps' — complete your first game.", link: "/achievements" },
    { userId: userIds[7], type: "friend_request", title: "New Friend Request", message: "NeonRider wants to be your friend!", link: "/friends" },
    { userId: userIds[7], type: "tournament", title: "Tournament Starting Soon", message: "Cyber Arena Weekend Cup starts in 30 minutes!", link: "/tournaments" },
    { userId: userIds[7], type: "system", title: "Welcome to GamingOS!", message: "Thank you for joining. Explore games, join tournaments, and connect with friends." },
    { userId: userIds[7], type: "review", title: "New Review Posted", message: "ShadowBlade reviewed 'Cyber Arena' — 5 stars!", link: "/games/1" },
    { userId: userIds[0], type: "achievement", title: "Legendary Status", message: "You reached level 50! Congratulations, ShadowBlade.", link: "/achievements" },
    { userId: userIds[0], type: "marketplace", title: "Item Sold", message: "Your 'Neon Blade' skin was sold for 2,500 coins.", link: "/marketplace" },
    { userId: userIds[2], type: "tournament", title: "Tournament Victory!", message: "You won the 'Dragon Slayer Cup' — claim your rewards!", link: "/tournaments" },
    { userId: userIds[2], type: "system", title: "Subscription Upgraded", message: "Your subscription has been upgraded to VIP. Enjoy the perks!" },
  ]);

  console.log(`✅ Created 9 notifications`);

  // ───── Guilds ─────

  const [guild] = await db.insert(guildsTable).values({
    name: "Shadow Warriors",
    tag: "SW",
    description: "Elite competitive gaming clan. We dominate in Cyber Arena and Dragon's Quest.",
    logoUrl: null,
    ownerId: userIds[0],
    xp: 28450,
    level: 12,
  }).returning({ id: guildsTable.id });

  await db.insert(guildMembersTable).values([
    { guildId: guild.id, userId: userIds[0], role: "owner" },
    { guildId: guild.id, userId: userIds[1], role: "co_leader" },
    { guildId: guild.id, userId: userIds[5], role: "member" },
    { guildId: guild.id, userId: userIds[7], role: "member" },
  ]);

  const [guild2] = await db.insert(guildsTable).values({
    name: "Phoenix Rising",
    tag: "PR",
    description: "Casual-friendly guild for RPG and adventure lovers.",
    logoUrl: null,
    ownerId: userIds[2],
    xp: 18500,
    level: 8,
  }).returning({ id: guildsTable.id });

  await db.insert(guildMembersTable).values([
    { guildId: guild2.id, userId: userIds[2], role: "owner" },
    { guildId: guild2.id, userId: userIds[3], role: "member" },
    { guildId: guild2.id, userId: userIds[4], role: "member" },
  ]);

  await pool.query(`UPDATE guilds SET member_count = 4 WHERE id = ${guild.id}`);
  await pool.query(`UPDATE guilds SET member_count = 3 WHERE id = ${guild2.id}`);

  console.log(`✅ Created 2 guilds with 7 members`);

  // ───── Parties ─────

  const [party] = await db.insert(partiesTable).values({
    name: "Weekend Warriors",
    gameName: "Cyber Arena",
    leaderId: userIds[0],
    maxMembers: 4,
  }).returning({ id: partiesTable.id });

  await db.insert(partyMembersTable).values([
    { partyId: party.id, userId: userIds[0], isReady: true },
    { partyId: party.id, userId: userIds[1], isReady: true },
    { partyId: party.id, userId: userIds[5], isReady: false },
  ]);

  console.log(`✅ Created 1 party with 3 members`);

  // ───── Events ─────

  await db.insert(eventsTable).values([
    { title: "Double XP Weekend", description: "Earn double XP in all games this weekend!", type: "double_xp", gameId: null, startsAt: new Date(), endsAt: new Date(Date.now() + 172800000), imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80", isLive: "true" },
    { title: "Cyber Arena New Season", description: "Season 3 is here with new maps and weapons!", type: "season_launch", gameId: gameIds[0], startsAt: new Date(Date.now() + 86400000), endsAt: new Date(Date.now() + 2592000000), imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b8f7c?w=800&q=80", isLive: "true" },
    { title: "Summer Sale", description: "Up to 50% off on popular games!", type: "sale", gameId: null, startsAt: new Date(Date.now() + 43200000), endsAt: new Date(Date.now() + 604800000), imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80", isLive: "false" },
    { title: "New Game Release: Starlight Explorer", description: "Explore infinite procedurally-generated universe", type: "new_release", gameId: gameIds[9], startsAt: new Date(), endsAt: new Date(Date.now() + 2592000000), imageUrl: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800&q=80", isLive: "true" },
    { title: "Community Tournament Finals", description: "Watch the top 16 players compete live!", type: "tournament", gameId: gameIds[8], startsAt: new Date(Date.now() + 345600000), endsAt: new Date(Date.now() + 432000000), imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80", isLive: "false" },
  ]);

  console.log(`✅ Created 5 events`);

  console.log("\n🎉 Seeding complete!");
  console.log(`📊 Summary:`);
  console.log(`   - ${userIds.length} users`);
  console.log(`   - ${gameIds.length} games`);
  console.log(`   - ${subscriptionPlanIds.length} subscription plans`);
  console.log(`   - ${achievementIds.length} achievements`);
  console.log(`   - ${marketplaceItemIds.length} marketplace items`);
  console.log(`   - ${tournamentIds.length} tournaments`);
  console.log(`   - 5 events`);
  console.log(`   - 11 friendships`);
  console.log(`   - 20 reviews`);
  console.log(`   - 8 wishlist entries`);
  console.log(`\n👤 Demo user: id=${userIds[7]}, username=demouser`);
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));

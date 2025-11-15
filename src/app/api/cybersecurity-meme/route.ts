import { NextRequest, NextResponse } from 'next/server';

// Configuration from environment variables
const ENABLE_REDDIT_API = process.env.ENABLE_REDDIT_API === 'true';
const FALLBACK_TO_CURATED = process.env.FALLBACK_TO_CURATED !== 'false';
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'CyberLab-Meme-Bot/1.0';

// Curated cybersecurity memes from popular sources
const CYBERSECURITY_MEMES = [
  {
    url: "https://i.imgflip.com/1bij.jpg",
    description: "When you patch one vulnerability but create three new ones",
    topic: "Vulnerability management",
    title: "The Endless Cycle"
  },
  {
    url: "https://i.imgflip.com/30b1gx.jpg", 
    description: "Password123! → Password123!! → MyPassword123! → MySecurePassword123!",
    topic: "Password security",
    title: "Password Evolution"
  },
  {
    url: "https://i.imgflip.com/1g8my4.jpg",
    description: "Clicking suspicious links ❌ | Teaching others about phishing ✅",
    topic: "Phishing awareness",
    title: "Security Mindset"
  },
  {
    url: "https://i.imgflip.com/26am.jpg",
    description: "When someone asks me to whitelist their sketchy website",
    topic: "Web security",
    title: "Awkward Security Moment"
  },
  {
    url: "https://i.imgflip.com/1ihzfe.jpg",
    description: "The scroll of truth: 'Users will always find a way to bypass security'",
    topic: "User behavior",
    title: "Universal Truth"
  },
  {
    url: "https://i.imgflip.com/1otk96.jpg",
    description: "Me looking at a new zero-day exploit while my incident response plan sits ignored",
    topic: "Incident response",
    title: "Distracted by Threats"
  },
  {
    url: "https://i.imgflip.com/4t0m5.jpg",
    description: "Me: 'Use strong passwords!' | Users: 'password123'",
    topic: "Password policy",
    title: "Security vs Reality"
  },
  {
    url: "https://i.imgflip.com/16iyn1.jpg",
    description: "Walking away from a successful penetration test",
    topic: "Penetration testing",
    title: "Mission Accomplished"
  },
  {
    url: "https://i.imgflip.com/1bij.jpg",
    description: "Storing passwords in plain text ❌ | Using a password manager ✅",
    topic: "Password management",
    title: "Smart Security"
  },
  {
    url: "https://i.imgflip.com/30b1gx.jpg",
    description: "No 2FA → SMS 2FA → Authenticator app → Hardware keys",
    topic: "Multi-factor authentication",
    title: "2FA Evolution"
  },
  {
    url: "https://i.imgflip.com/1g8my4.jpg",
    description: "Ignoring security updates ❌ | Patching immediately ✅",
    topic: "Patch management",
    title: "Update Discipline"
  },
  {
    url: "https://i.imgflip.com/26am.jpg",
    description: "When the CEO asks me to disable the firewall 'temporarily'",
    topic: "Corporate security",
    title: "Management Requests"
  },
  {
    url: "https://i.imgflip.com/1ihzfe.jpg",
    description: "The scroll of truth: 'Social engineering is still the easiest attack vector'",
    topic: "Social engineering",
    title: "Human Factor"
  },
  {
    url: "https://i.imgflip.com/1otk96.jpg",
    description: "Me explaining why we need security | Budget looking at cheaper options",
    topic: "Security budget",
    title: "Investment Priorities"
  },
  {
    url: "https://i.imgflip.com/4t0m5.jpg",
    description: "IT Security: 'Don't click suspicious links!' | Karen from accounting: *clicks everything*",
    topic: "Security awareness",
    title: "Training Reality"
  },
  {
    url: "https://i.imgflip.com/16iyn1.jpg",
    description: "Walking away after setting up perfect network segmentation",
    topic: "Network security",
    title: "Defense in Depth"
  },
  {
    url: "https://i.imgflip.com/1bij.jpg",
    description: "Using admin privileges for everything ❌ | Principle of least privilege ✅",
    topic: "Access control",
    title: "Privilege Management"
  },
  {
    url: "https://i.imgflip.com/30b1gx.jpg",
    description: "HTTP → HTTPS → HTTPS with HSTS → Full end-to-end encryption",
    topic: "Encryption",
    title: "Security Protocols"
  },
  {
    url: "https://i.imgflip.com/1g8my4.jpg",
    description: "Downloading from sketchy sites ❌ | Verifying checksums and signatures ✅",
    topic: "Supply chain security",
    title: "Download Safety"
  },
  {
    url: "https://i.imgflip.com/26am.jpg",
    description: "When someone asks me to turn off antivirus to install their 'totally safe' software",
    topic: "Malware protection",
    title: "Red Flags"
  },
  {
    url: "https://i.imgflip.com/1bij.jpg",
    description: "When you find a critical vulnerability but management says 'fix it next quarter'",
    topic: "Risk management",
    title: "Priority Mismatch"
  },
  {
    url: "https://i.imgflip.com/30b1gx.jpg",
    description: "Trying to explain why we can't just 'add more encryption' to fix everything",
    topic: "Encryption myths",
    title: "Technical Debt"
  },
  {
    url: "https://i.imgflip.com/1g8my4.jpg",
    description: "When someone says 'I don't need backups, nothing bad ever happens to me'",
    topic: "Backup strategy",
    title: "Famous Last Words"
  },
  {
    url: "https://i.imgflip.com/26am.jpg",
    description: "Me watching someone use 'admin' as both username and password",
    topic: "Authentication fails",
    title: "Security Nightmare"
  },
  {
    url: "https://i.imgflip.com/1ihzfe.jpg",
    description: "When you successfully phish your own CEO during security training",
    topic: "Security awareness",
    title: "Educational Moment"
  },
  {
    url: "https://i.imgflip.com/1otk96.jpg",
    description: "Incident response team vs. the latest ransomware attack",
    topic: "Incident response",
    title: "Battle Mode"
  },
  {
    url: "https://i.imgflip.com/4t0m5.jpg",
    description: "When you patch one vulnerability and discover ten more",
    topic: "Vulnerability management",
    title: "Hydra Effect"
  },
  {
    url: "https://i.imgflip.com/16iyn1.jpg",
    description: "Successfully implementing zero-trust architecture",
    topic: "Zero trust",
    title: "Trust No One"
  },
  {
    url: "https://i.imgflip.com/1bij.jpg",
    description: "When developers say 'security is not our job'",
    topic: "DevSecOps",
    title: "Shared Responsibility"
  },
  {
    url: "https://i.imgflip.com/30b1gx.jpg",
    description: "SQL injection → XSS → CSRF → RCE",
    topic: "Web exploitation",
    title: "Attack Chain"
  },
  {
    url: "https://i.imgflip.com/1g8my4.jpg",
    description: "When you find hardcoded credentials in production code",
    topic: "Code security",
    title: "Developer Surprise"
  },
  {
    url: "https://i.imgflip.com/26am.jpg",
    description: "Explaining why 'just use blockchain' won't solve every security problem",
    topic: "Buzzword bingo",
    title: "Hype vs Reality"
  },
  {
    url: "https://i.imgflip.com/1ihzfe.jpg",
    description: "When someone asks if their IoT doorbell is secure",
    topic: "IoT security",
    title: "Internet of Troubles"
  },
  {
    url: "https://i.imgflip.com/1otk96.jpg",
    description: "Security team vs. 'But it works in development!'",
    topic: "Environment differences",
    title: "Production Reality"
  }
];

// Reddit API authentication function
async function getRedditAccessToken(): Promise<string | null> {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || 
      REDDIT_CLIENT_ID === 'your_reddit_client_id_here' || 
      REDDIT_CLIENT_SECRET === 'your_reddit_client_secret_here') {
    console.log('❌ Reddit API credentials not configured or using placeholder values');
    return null;
  }

  try {
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': REDDIT_USER_AGENT
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      console.warn('Failed to get Reddit access token:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.warn('Error getting Reddit access token:', error);
    return null;
  }
}

// Enhanced Reddit API function with authentication
async function fetchRedditMemesWithAuth(): Promise<{ url: string; description: string; topic: string; title: string } | null> {
  const accessToken = await getRedditAccessToken();
  if (!accessToken) {
    throw new Error('Failed to authenticate with Reddit API');
  }

  try {
    const subreddits = [
      'cybersecurity',
      'netsec', 
      'hacking',
      'sysadmin',
      'ITCareerQuestions',
      'ProgrammerHumor',
      'techsupportgore',
      'linuxmemes',
      'infosec'
    ];

    for (let attempt = 0; attempt < 3; attempt++) {
      const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
      
      const response = await fetch(`https://oauth.reddit.com/r/${randomSubreddit}/hot?limit=50`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': REDDIT_USER_AGENT
        }
      });

      if (!response.ok) continue;

      const data = await response.json();
      
      if (data.data && data.data.children && data.data.children.length > 0) {
        const suitablePosts = data.data.children.filter((post: any) => {
          const postData = post.data;
          return postData.url && (
            postData.url.includes('.jpg') || 
            postData.url.includes('.png') || 
            postData.url.includes('.gif') ||
            postData.url.includes('i.redd.it') ||
            postData.url.includes('imgur.com') ||
            postData.preview
          );
        });

        if (suitablePosts.length > 0) {
          const randomPost = suitablePosts[Math.floor(Math.random() * suitablePosts.length)];
          const postData = randomPost.data;
          
          let imageUrl = postData.url;
          if (postData.preview && postData.preview.images && postData.preview.images[0]) {
            imageUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&');
          }

          return {
            url: imageUrl,
            description: postData.title,
            topic: `r/${randomSubreddit}`,
            title: postData.title.length > 60 ? postData.title.substring(0, 60) + '...' : postData.title
          };
        }
      }
    }
    
    throw new Error('No suitable memes found');
  } catch (error) {
    console.error('Error fetching Reddit memes with auth:', error);
    throw error;
  }
}

// Function to fetch cybersecurity memes from Reddit (public API)
async function fetchRedditMemes(): Promise<{ url: string; description: string; topic: string; title: string } | null> {
  try {
    // Cybersecurity meme-focused subreddits and search terms
    const subreddits = [
      'cybersecurity',
      'netsec', 
      'hacking',
      'sysadmin',
      'ITCareerQuestions',
      'ProgrammerHumor',
      'techsupportgore',
      'linuxmemes',
      'AskNetsec',
      'blackhat',
      'infosec',
      'ComputerScienceHumor'
    ];
    
    // Try multiple subreddits if needed
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        // Select random subreddit
        const randomSubreddit = subreddits[Math.floor(Math.random() * subreddits.length)];
        
        console.log(`🔍 Trying subreddit: r/${randomSubreddit} (attempt ${attempt + 1})`);
        
        // Try different Reddit endpoints for better meme content
        const endpoints = [
          `https://www.reddit.com/r/${randomSubreddit}/hot.json?limit=50`,
          `https://www.reddit.com/r/${randomSubreddit}/top.json?t=week&limit=50`,
          `https://www.reddit.com/search.json?q=cybersecurity+meme+subreddit:${randomSubreddit}&limit=25`,
          `https://www.reddit.com/search.json?q=security+funny+subreddit:${randomSubreddit}&limit=25`,
          `https://www.reddit.com/search.json?q=hacker+meme+subreddit:${randomSubreddit}&limit=25`
        ];
        
        const endpoint = endpoints[attempt % endpoints.length];
        
        // Fetch from Reddit API with better error handling for hosting environments
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(endpoint, {
          headers: {
            'User-Agent': REDDIT_USER_AGENT,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn(`❌ r/${randomSubreddit} failed with status ${response.status}`);
          continue; // Try next subreddit
        }
        
        const data = await response.json();
        
        if (data.data && data.data.children && data.data.children.length > 0) {
          // More flexible filtering for posts
          const suitablePosts = data.data.children.filter((post: any) => {
            const postData = post.data;
            
            // Check if it's an image post or has image content
            const hasImage = postData.url && (
              postData.url.includes('.jpg') || 
              postData.url.includes('.png') || 
              postData.url.includes('.gif') ||
              postData.url.includes('.webp') ||
              postData.url.includes('i.redd.it') ||
              postData.url.includes('imgur.com') ||
              postData.url.includes('i.imgur.com') ||
              postData.url.includes('imgflip.com') ||
              postData.url.includes('memegen') ||
              postData.preview || // Reddit preview available
              (postData.thumbnail && postData.thumbnail !== 'self' && postData.thumbnail !== 'default') // Has thumbnail
            );
            
            // Check if title contains meme/humor/security indicators
            const titleLower = postData.title.toLowerCase();
            const isMemeRelated = titleLower.includes('meme') || 
                                titleLower.includes('humor') || 
                                titleLower.includes('funny') ||
                                titleLower.includes('joke') ||
                                titleLower.includes('lol') ||
                                titleLower.includes('security') ||
                                titleLower.includes('hacker') ||
                                titleLower.includes('cyber') ||
                                titleLower.includes('password') ||
                                titleLower.includes('phishing') ||
                                titleLower.includes('malware') ||
                                titleLower.includes('ransomware') ||
                                titleLower.includes('vulnerability') ||
                                titleLower.includes('penetration') ||
                                titleLower.includes('firewall') ||
                                titleLower.includes('encryption') ||
                                postData.link_flair_text?.toLowerCase().includes('humor') ||
                                postData.link_flair_text?.toLowerCase().includes('meme') ||
                                postData.link_flair_text?.toLowerCase().includes('funny');
            
            // Include posts from meme-heavy subreddits even without explicit keywords
            const isMemeSubreddit = ['ProgrammerHumor', 'linuxmemes', 'ComputerScienceHumor', 'techsupportgore'].includes(randomSubreddit);
            
            return hasImage && (isMemeRelated || isMemeSubreddit || postData.score > 100); // Include popular posts
          });
          
          if (suitablePosts.length > 0) {
            // Select random suitable post
            const randomPost = suitablePosts[Math.floor(Math.random() * suitablePosts.length)];
            const postData = randomPost.data;
            
            // Use the best available image URL
            let imageUrl = postData.url;
            if (postData.preview && postData.preview.images && postData.preview.images[0]) {
              imageUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&');
            }
            
            console.log(`✅ Found suitable post: "${postData.title}" from r/${randomSubreddit}`);
            
            return {
              url: imageUrl,
              description: postData.title,
              topic: `r/${randomSubreddit}`,
              title: postData.title.length > 60 ? postData.title.substring(0, 60) + '...' : postData.title
            };
          } else {
            console.log(`⚠️ No suitable posts found in r/${randomSubreddit}`);
          }
        }
      } catch (subredditError) {
        console.warn(`❌ Error with r/${subreddits[attempt % subreddits.length]}:`, subredditError);
        continue;
      }
    }
    
    throw new Error('No suitable memes found after trying multiple subreddits');
  } catch (error) {
    console.error('Error fetching Reddit memes:', error);
    throw error;
  }
}

// Function to search for cybersecurity memes across all Reddit
async function searchRedditCyberMemes(): Promise<{ url: string; description: string; topic: string; title: string } | null> {
  try {
    const searchQueries = [
      'cybersecurity meme',
      'security funny',
      'hacker meme', 
      'password meme',
      'phishing meme',
      'IT security humor',
      'cyber attack funny',
      'malware meme',
      'penetration testing funny',
      'firewall humor'
    ];
    
    const randomQuery = searchQueries[Math.floor(Math.random() * searchQueries.length)];
    console.log(`🔍 Searching Reddit for: "${randomQuery}"`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(randomQuery)}&sort=top&t=month&limit=50`, {
      headers: {
        'User-Agent': REDDIT_USER_AGENT,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Reddit search failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data.children && data.data.children.length > 0) {
      const imagePosts = data.data.children.filter((post: any) => {
        const postData = post.data;
        return postData.url && (
          postData.url.includes('.jpg') || 
          postData.url.includes('.png') || 
          postData.url.includes('.gif') ||
          postData.url.includes('.webp') ||
          postData.url.includes('i.redd.it') ||
          postData.url.includes('imgur.com') ||
          postData.url.includes('i.imgur.com') ||
          postData.url.includes('imgflip.com') ||
          postData.preview ||
          (postData.thumbnail && postData.thumbnail !== 'self' && postData.thumbnail !== 'default')
        );
      });
      
      if (imagePosts.length > 0) {
        const randomPost = imagePosts[Math.floor(Math.random() * imagePosts.length)];
        const postData = randomPost.data;
        
        let imageUrl = postData.url;
        if (postData.preview && postData.preview.images && postData.preview.images[0]) {
          imageUrl = postData.preview.images[0].source.url.replace(/&amp;/g, '&');
        }
        
        console.log(`✅ Found meme via search: "${postData.title}" from r/${postData.subreddit}`);
        
        return {
          url: imageUrl,
          description: postData.title,
          topic: `r/${postData.subreddit}`,
          title: postData.title.length > 60 ? postData.title.substring(0, 60) + '...' : postData.title
        };
      }
    }
    
    throw new Error('No memes found in search results');
  } catch (error) {
    console.error('Error searching Reddit for memes:', error);
    throw error;
  }
}

function getDailyMeme(): { url: string; description: string; topic: string; title: string } {
  // Use current date as seed for consistent daily meme
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const memeIndex = dayOfYear % CYBERSECURITY_MEMES.length;
  
  return CYBERSECURITY_MEMES[memeIndex];
}

function getRandomMeme(): { url: string; description: string; topic: string; title: string } {
  const randomIndex = Math.floor(Math.random() * CYBERSECURITY_MEMES.length);
  return CYBERSECURITY_MEMES[randomIndex];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    const today = new Date().toDateString();
    let memeData;
    let memeSource = 'curated'; // Default to curated for hosting compatibility
    
    // Try Reddit API first if explicitly enabled
    if (ENABLE_REDDIT_API === true) {
      // Reddit API is explicitly enabled - try regardless of environment
      try {
        console.log('🔧 Reddit API enabled: Attempting to fetch meme from Reddit...');
        
        let redditMeme;
        
        // Try authenticated API first if credentials are available
        if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
          console.log('Using authenticated Reddit API...');
          try {
            redditMeme = await fetchRedditMemesWithAuth();
            console.log('✅ Successfully fetched authenticated Reddit meme');
          } catch (authError) {
            console.log('Authenticated API failed, trying public API...');
            // Fall back to public API
            try {
              redditMeme = await fetchRedditMemes();
            } catch (publicError) {
              console.log('Public API failed, trying search...');
              redditMeme = await searchRedditCyberMemes();
            }
          }
        } else {
          // Use public API
          try {
            redditMeme = await fetchRedditMemes();
          } catch (subredditError) {
            console.log('Subreddit fetch failed, trying search...');
            redditMeme = await searchRedditCyberMemes();
          }
        }
        
        if (redditMeme) {
          memeData = redditMeme;
          console.log('✅ Successfully fetched Reddit meme:', redditMeme.title);
          memeSource = 'reddit';
        } else {
          throw new Error('Reddit returned null');
        }
      } catch (redditError) {
        const errorMessage = redditError instanceof Error ? redditError.message : 'Unknown error';
        console.warn('❌ Reddit API failed, falling back to curated collection:', errorMessage);
        
        if (FALLBACK_TO_CURATED) {
          memeData = forceRefresh ? getRandomMeme() : getDailyMeme();
          memeSource = 'curated';
          console.log('📚 Using curated meme as fallback:', memeData.title);
        } else {
          throw redditError; // Re-throw if fallback is disabled
        }
      }
    } else if (ENABLE_REDDIT_API === false) {
      console.log('🔒 Reddit API explicitly disabled, using curated memes');
      memeData = forceRefresh ? getRandomMeme() : getDailyMeme();
      memeSource = 'curated';
      console.log('📚 Using curated meme:', memeData.title);
    } else {
      // ENABLE_REDDIT_API is undefined or not set - use environment-based logic
      if (process.env.NODE_ENV === 'development') {
        // In development, try Reddit API by default
        try {
          console.log('🔧 Development mode: Attempting to fetch meme from Reddit...');
          
          let redditMeme;
          
          // Try authenticated API first if credentials are available
          if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
            console.log('Using authenticated Reddit API...');
            try {
              redditMeme = await fetchRedditMemesWithAuth();
              console.log('✅ Successfully fetched authenticated Reddit meme');
            } catch (authError) {
              console.log('Authenticated API failed, trying public API...');
              // Fall back to public API
              try {
                redditMeme = await fetchRedditMemes();
              } catch (publicError) {
                console.log('Public API failed, trying search...');
                redditMeme = await searchRedditCyberMemes();
              }
            }
          } else {
            // Use public API
            try {
              redditMeme = await fetchRedditMemes();
            } catch (subredditError) {
              console.log('Subreddit fetch failed, trying search...');
              redditMeme = await searchRedditCyberMemes();
            }
          }
          
          if (redditMeme) {
            memeData = redditMeme;
            console.log('✅ Successfully fetched Reddit meme:', redditMeme.title);
            memeSource = 'reddit';
          } else {
            throw new Error('Reddit returned null');
          }
        } catch (redditError) {
          const errorMessage = redditError instanceof Error ? redditError.message : 'Unknown error';
          console.warn('❌ Reddit API failed in development, falling back to curated collection:', errorMessage);
          
          if (FALLBACK_TO_CURATED) {
            memeData = forceRefresh ? getRandomMeme() : getDailyMeme();
            memeSource = 'curated';
            console.log('📚 Using curated meme as fallback:', memeData.title);
          } else {
            throw redditError; // Re-throw if fallback is disabled
          }
        }
      } else if (!process.env.VERCEL && !process.env.CLOUDFLARE && !process.env.CF_PAGES) {
        // In production, only try Reddit if not in known restricted environments
        try {
          console.log('🚀 Production mode: Attempting to fetch meme from Reddit...');
          
          let redditMeme;
          
          // Try authenticated API first if credentials are available
          if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
            console.log('Using authenticated Reddit API...');
            try {
              redditMeme = await fetchRedditMemesWithAuth();
              console.log('✅ Successfully fetched authenticated Reddit meme');
            } catch (authError) {
              console.log('Authenticated API failed, trying public API...');
              // Fall back to public API
              try {
                redditMeme = await fetchRedditMemes();
              } catch (publicError) {
                console.log('Public API failed, trying search...');
                redditMeme = await searchRedditCyberMemes();
              }
            }
          } else {
            // Use public API
            try {
              redditMeme = await fetchRedditMemes();
            } catch (subredditError) {
              console.log('Subreddit fetch failed, trying search...');
              redditMeme = await searchRedditCyberMemes();
            }
          }
          
          if (redditMeme) {
            memeData = redditMeme;
            console.log('✅ Successfully fetched Reddit meme:', redditMeme.title);
            memeSource = 'reddit';
          } else {
            throw new Error('Reddit returned null');
          }
        } catch (redditError) {
          const errorMessage = redditError instanceof Error ? redditError.message : 'Unknown error';
          console.warn('❌ Reddit API failed in production, falling back to curated collection:', errorMessage);
          
          // Check if this is a hosting environment restriction
          if (errorMessage.includes('fetch') || errorMessage.includes('network') || errorMessage.includes('timeout')) {
            console.log('🏗️ Detected hosting environment restrictions - using curated memes');
          }
          
          if (FALLBACK_TO_CURATED) {
            memeData = forceRefresh ? getRandomMeme() : getDailyMeme();
            memeSource = 'curated';
            console.log('📚 Using curated meme as fallback:', memeData.title);
          } else {
            throw redditError; // Re-throw if fallback is disabled
          }
        }
      } else {
        console.log('🔒 Reddit API disabled in hosting environment by default, using curated memes');
        console.log('💡 Set ENABLE_REDDIT_API=true to force enable Reddit API in hosting environments');
        memeData = forceRefresh ? getRandomMeme() : getDailyMeme();
        memeSource = 'curated';
        console.log('📚 Using curated meme:', memeData.title);
      }
    }

    return NextResponse.json({
      success: true,
      meme: {
        url: memeData.url,
        topic: memeData.topic,
        source: memeSource,
        date: today,
        title: memeData.title,
        description: memeData.description
      }
    });
    
  } catch (error) {
    console.error('💥 Critical error in cybersecurity meme API:', error);
    
    // Emergency fallback to curated memes
    const fallbackMeme = CYBERSECURITY_MEMES[0];
    console.log('🚨 Using emergency fallback meme:', fallbackMeme.title);
    
    return NextResponse.json({
      success: true,
      meme: {
        url: fallbackMeme.url,
        topic: fallbackMeme.topic,
        source: 'curated',
        date: new Date().toDateString(),
        title: fallbackMeme.title,
        description: fallbackMeme.description
      }
    });
  }
}
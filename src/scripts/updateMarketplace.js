const fs = require('fs');
const path = require('path');
const https = require('https');

const REPO_URL = 'https://raw.githubusercontent.com/VoltAgent/awesome-openclaw-skills/main/';
const DATA_DIR = path.join(__dirname, '..', '..', 'data', 'marketplace');

// Map categories to fetch
const CATEGORIES = [
    'ai-and-llms',
    'apple-apps-and-services',
    'browser-and-automation',
    'calendar-and-scheduling',
    'clawdbot-tools',
    'cli-utilities',
    'coding-agents-and-ides',
    'communication',
    'data-and-analytics',
    'devops-and-cloud',
    'finance',
    'gaming',
    'git-and-github',
    'health-and-fitness',
    'image-and-video-generation',
    'ios-and-macos-development',
    'marketing-and-sales',
    'media-and-streaming',
    'moltbook',
    'notes-and-pkm',
    'pdf-and-documents',
    'personal-development',
    'productivity-and-tasks',
    'search-and-research',
    'security-and-passwords',
    'self-hosted-and-automation',
    'shopping-and-e-commerce',
    'smart-home-and-iot',
    'speech-and-transcription',
    'transportation',
    'web-and-frontend-development'
];

async function fetchFile(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode !== 200) {
                return reject(new Error(`Failed to fetch ${url}, status: ${res.statusCode}`));
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function translateToZhTW(text) {
    if (!text || text.trim() === '') return text;
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-tw&dt=t&q=${encodeURIComponent(text)}`;
        const content = await fetchFile(url);
        const parsed = JSON.parse(content);
        if (parsed && parsed[0]) {
            return parsed[0].map(s => s[0]).join('');
        }
        return text;
    } catch (e) {
        console.error("Translation error for text:", text, e.message);
        return text;
    }
}

async function run() {
    console.log('Fetching & Translating OpenClaw Skills...');
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    let globalTotal = 0;
    let translatedCount = 0;

    for (const cat of CATEGORIES) {
        try {
            const url = `${REPO_URL}categories/${cat}.md`;
            console.log(`\nFetching ${cat}...`);
            const content = await fetchFile(url);

            const outFile = path.join(DATA_DIR, `${cat}.json`);
            let existingMap = {};
            if (fs.existsSync(outFile)) {
                try {
                    const oldData = JSON.parse(fs.readFileSync(outFile, 'utf8'));
                    oldData.forEach(s => {
                        existingMap[s.id] = s;
                    });
                } catch (e) { }
            }

            const parsedSkills = [];
            const lines = content.split('\n');
            let catCount = 0;

            for (const line of lines) {
                const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\) - (.*)$/);
                if (match) {
                    const rawTitle = match[1];
                    const rawId = rawTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '');
                    const rawRepoUrl = match[2];
                    const rawDesc = match[3];

                    let finalDesc = rawDesc;
                    let descZh = "";

                    // Incremental Cache Check
                    if (existingMap[rawId] && existingMap[rawId].original_description === rawDesc && existingMap[rawId].description_zh) {
                        finalDesc = existingMap[rawId].description_zh;
                        descZh = existingMap[rawId].description_zh;
                    } else {
                        // Needs translation
                        descZh = await translateToZhTW(rawDesc);
                        finalDesc = descZh;
                        translatedCount++;
                        // Small throttle to avoid Google ban
                        await new Promise(r => setTimeout(r, 100));
                    }

                    parsedSkills.push({
                        title: rawTitle,
                        id: rawId,
                        repoUrl: rawRepoUrl,
                        description: finalDesc,
                        original_description: rawDesc,
                        description_zh: descZh,
                        category: cat
                    });
                    catCount++;
                }
            }

            fs.writeFileSync(outFile, JSON.stringify(parsedSkills, null, 2));
            console.log(`➡️  Saved ${catCount} skills to ${cat}.json`);
            globalTotal += catCount;

        } catch (e) {
            console.error(`Error processing category ${cat}:`, e.message);
        }
    }

    console.log(`\n✅ Finished! Read ${globalTotal} total skills. Made ${translatedCount} new translation requests.`);
}

run();

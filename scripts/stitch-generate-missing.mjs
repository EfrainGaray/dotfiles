import { stitch } from "@google/stitch-sdk";

const PROJECT_ID = "18069814474819705735";

const missing = [
  "PhantomRelay Run History page. Notion dark #0b0e15. Sidebar. H1 Run History. Filters date status scraper mode. Stats 1247 total 94.2% success 892ms avg. Notion table 10 rows status dot name mode latency signals date duration.",
  "PhantomRelay Monitoring dashboard. Notion dark #0b0e15. Sidebar. H1 Monitoring. Fleet cards Ready 3 Busy 1 Dead 1 Capacity 5. Latency chart p50 p95 p99. Success rate chart. Detection signals bars. Escalation log.",
  "PhantomRelay Run Detail. Notion dark #0b0e15. Sidebar. Breadcrumb. H1 Amazon_Price_Monitor. Success badge Stealth 3.2s. Tabs Result Screenshot HAR Signals. HTML code block. Right metadata. Retry button.",
  "PhantomRelay Proxies management. Notion dark #0b0e15. Sidebar. H1 Proxies. Pool cards with health. Proxy table health bars latency requests bans. Domain ban list.",
  "PhantomRelay Alerts inbox. Notion dark #0b0e15. Sidebar. H1 Alerts. Tabs Inbox Rules. Feed warning error info success notifications. Timestamps. Mark all read.",
  "PhantomRelay Wizard Step 4 Extraction. Notion dark #0b0e15. Sidebar stepper. Toggle cards HTML Text Screenshot HAR. CSS Selectors inputs. Back Continue.",
  "PhantomRelay Wizard Step 5 Anti-Detection. Notion dark #0b0e15. Sidebar stepper. Proxy pool dropdown. CAPTCHA toggle. Aged profile. Extra headers inputs. Back Continue.",
  "PhantomRelay Wizard Step 8 Review Launch. Notion dark #0b0e15. Sidebar stepper final. Summary property list all config. Edit links. Estimated usage. Launch Scraper button.",
  "PhantomRelay Signup page. Notion dark #0b0e15. Split layout brand left form right. Name email password strength confirm terms. Create Account. Google GitHub OAuth.",
  "PhantomRelay Onboarding. Notion dark #0b0e15. Centered. Logo Welcome. 3 steps Quick Scrape expanded Create Scraper Notifications. Progress. Skip link.",
  "PhantomRelay API Docs. Notion dark #0b0e15. Sidebar. H1 API Reference. Nav sections. POST /scrape endpoint docs code blocks parameters table. Code snippets curl Python Node.",
  "PhantomRelay Mobile dashboard. Notion dark #0b0e15. Hamburger logo avatar. Stats 2x2. Usage bar. Recent runs. Fleet dots. Bottom tab bar.",
  "PhantomRelay Mobile scrapers. Notion dark #0b0e15. Search plus icon. 5 scraper cards stacked. Bottom tab bar. Touch friendly.",
  "PhantomRelay Mobile login. Notion dark #0b0e15. Logo centered. Welcome back. Email Password. Sign In blue. Google GitHub. Create account link.",
];

async function main() {
  const project = stitch.project(PROJECT_ID);

  for (let i = 0; i < missing.length; i++) {
    console.log(`Generating ${i + 1}/${missing.length}...`);
    try {
      const screen = await project.generate(missing[i]);
      console.log(`  ✅ Done`);
    } catch (err) {
      console.log(`  ❌ ${err.message}`);
    }
  }

  const screens = await project.screens();
  console.log(`\nTotal screens in Stitch: ${screens.length}`);
}

main().catch(console.error);

const WebsiteCategory = {
  Informational: 'Informational',
  SocialMedia: 'Social Media',
  ECommerce: 'E-Commerce',
  Educational: 'Educational',
  Entertainment: 'Entertainment',
  BloggingPersonal: 'Blogging/Personal',
  ProductivityCollaboration: 'Productivity and Collaboration',
  DevelopmentDesign: 'Development and Design',
  MediaNews: 'Media and News',
  ForumsCommunities: 'Forums and Communities',
  Adult: 'Adult',
};

const domainsByCategory: {[domain: string]: string} = {
  // Informational
  'wikipedia.org': WebsiteCategory.Informational,
  'britannica.com': WebsiteCategory.Informational,
  'howstuffworks.com': WebsiteCategory.Informational,
  'infoplease.com': WebsiteCategory.Informational,
  'encyclopedia.com': WebsiteCategory.Informational,
  'wiktionary.org': WebsiteCategory.Informational,
  'thefreedictionary.com': WebsiteCategory.Informational,
  'answers.com': WebsiteCategory.Informational,
  'dictionary.com': WebsiteCategory.Informational,
  'thesaurus.com': WebsiteCategory.Informational,
  'worldbookonline.com': WebsiteCategory.Informational,
  'reference.com': WebsiteCategory.Informational,
  'factmonster.com': WebsiteCategory.Informational,
  'wordreference.com': WebsiteCategory.Informational,
  'yourdictionary.com': WebsiteCategory.Informational,

  // Social Media
  'facebook.com': WebsiteCategory.SocialMedia,
  'twitter.com': WebsiteCategory.SocialMedia,
  'instagram.com': WebsiteCategory.SocialMedia,
  'linkedin.com': WebsiteCategory.SocialMedia,
  'pinterest.com': WebsiteCategory.SocialMedia,
  'snapchat.com': WebsiteCategory.SocialMedia,
  'tiktok.com': WebsiteCategory.SocialMedia,
  'whatsapp.com': WebsiteCategory.SocialMedia,
  'messenger.com': WebsiteCategory.SocialMedia,
  'discord.com': WebsiteCategory.SocialMedia,
  'reddit.com': WebsiteCategory.SocialMedia,
  'viber.com': WebsiteCategory.SocialMedia,
  'weibo.com': WebsiteCategory.SocialMedia,
  'line.me': WebsiteCategory.SocialMedia,
  'telegram.org': WebsiteCategory.SocialMedia,

  // E-Commerce
  'amazon.com': WebsiteCategory.ECommerce,
  'ebay.com': WebsiteCategory.ECommerce,
  'walmart.com': WebsiteCategory.ECommerce,
  'etsy.com': WebsiteCategory.ECommerce,
  'alibaba.com': WebsiteCategory.ECommerce,
  'bestbuy.com': WebsiteCategory.ECommerce,
  'newegg.com': WebsiteCategory.ECommerce,
  'shopify.com': WebsiteCategory.ECommerce,
  'homedepot.com': WebsiteCategory.ECommerce,
  'target.com': WebsiteCategory.ECommerce,
  'costco.com': WebsiteCategory.ECommerce,
  'overstock.com': WebsiteCategory.ECommerce,
  'zalando.com': WebsiteCategory.ECommerce,
  'jd.com': WebsiteCategory.ECommerce,
  'rakuten.com': WebsiteCategory.ECommerce,

  // Educational
  'udemy.com': WebsiteCategory.Educational,
  'coursera.org': WebsiteCategory.Educational,
  'khanacademy.org': WebsiteCategory.Educational,
  'edx.org': WebsiteCategory.Educational,
  'mitocw.mit.edu': WebsiteCategory.Educational,
  'lynda.com': WebsiteCategory.Educational,
  'brainly.com': WebsiteCategory.Educational,
  'stanfordonline.stanford.edu': WebsiteCategory.Educational,
  'codecademy.com': WebsiteCategory.Educational,
  'futurelearn.com': WebsiteCategory.Educational,
  'schoolloop.com': WebsiteCategory.Educational,
  'duolingo.com': WebsiteCategory.Educational,
  'scholar.google.com': WebsiteCategory.Educational,
  'jstor.org': WebsiteCategory.Educational,
  'pbslearningmedia.org': WebsiteCategory.Educational,

  // Entertainment
  'netflix.com': WebsiteCategory.Entertainment,
  'spotify.com': WebsiteCategory.Entertainment,
  'hulu.com': WebsiteCategory.Entertainment,
  'imdb.com': WebsiteCategory.Entertainment,
  'youtube.com': WebsiteCategory.Entertainment,
  'vimeo.com': WebsiteCategory.Entertainment,
  'soundcloud.com': WebsiteCategory.Entertainment,
  'dailymotion.com': WebsiteCategory.Entertainment,
  'last.fm': WebsiteCategory.Entertainment,
  'vevo.com': WebsiteCategory.Entertainment,
  'twitch.tv': WebsiteCategory.Entertainment,
  'fandango.com': WebsiteCategory.Entertainment,
  'rottentomatoes.com': WebsiteCategory.Entertainment,
  '9gag.com': WebsiteCategory.Entertainment,
  'buzzfeed.com': WebsiteCategory.Entertainment,

  // Blogging/Personal
  'medium.com': WebsiteCategory.BloggingPersonal,
  'wordpress.com': WebsiteCategory.BloggingPersonal,
  'blogger.com': WebsiteCategory.BloggingPersonal,
  'tumblr.com': WebsiteCategory.BloggingPersonal,
  'livejournal.com': WebsiteCategory.BloggingPersonal,
  'blogspot.com': WebsiteCategory.BloggingPersonal,
  'typepad.com': WebsiteCategory.BloggingPersonal,
  'wix.com': WebsiteCategory.BloggingPersonal,
  'weebly.com': WebsiteCategory.BloggingPersonal,
  'squarespace.com': WebsiteCategory.BloggingPersonal,
  'penzu.com': WebsiteCategory.BloggingPersonal,
  'ghost.org': WebsiteCategory.BloggingPersonal,
  'hatenablog.com': WebsiteCategory.BloggingPersonal,
  'postach.io': WebsiteCategory.BloggingPersonal,
  'jekyllrb.com': WebsiteCategory.BloggingPersonal,

  // Productivity and Collaboration
  'trello.com': WebsiteCategory.ProductivityCollaboration,
  'slack.com': WebsiteCategory.ProductivityCollaboration,
  'asana.com': WebsiteCategory.ProductivityCollaboration,
  'notion.so': WebsiteCategory.ProductivityCollaboration,
  'microsoft.com': WebsiteCategory.ProductivityCollaboration,
  'zoom.us': WebsiteCategory.ProductivityCollaboration,
  'dropbox.com': WebsiteCategory.ProductivityCollaboration,
  'drive.google.com': WebsiteCategory.ProductivityCollaboration,
  'evernote.com': WebsiteCategory.ProductivityCollaboration,
  'todoist.com': WebsiteCategory.ProductivityCollaboration,
  'basecamp.com': WebsiteCategory.ProductivityCollaboration,
  'monday.com': WebsiteCategory.ProductivityCollaboration,
  'clickup.com': WebsiteCategory.ProductivityCollaboration,
  'canva.com': WebsiteCategory.ProductivityCollaboration,
  'airtable.com': WebsiteCategory.ProductivityCollaboration,

  // Development and Design
  'github.com': WebsiteCategory.DevelopmentDesign,
  'adobe.com': WebsiteCategory.DevelopmentDesign,
  'stackoverflow.com': WebsiteCategory.DevelopmentDesign,
  'w3schools.com': WebsiteCategory.DevelopmentDesign,
  'codepen.io': WebsiteCategory.DevelopmentDesign,
  'dribbble.com': WebsiteCategory.DevelopmentDesign,
  'behance.net': WebsiteCategory.DevelopmentDesign,
  'freecodecamp.org': WebsiteCategory.DevelopmentDesign,
  'codesandbox.io': WebsiteCategory.DevelopmentDesign,
  'figma.com': WebsiteCategory.DevelopmentDesign,
  'mdn.mozilla.org': WebsiteCategory.DevelopmentDesign,
  'netlify.com': WebsiteCategory.DevelopmentDesign,
  'heroku.com': WebsiteCategory.DevelopmentDesign,
  'jsfiddle.net': WebsiteCategory.DevelopmentDesign,
  'glitch.com': WebsiteCategory.DevelopmentDesign,
  localhost: WebsiteCategory.DevelopmentDesign,

  // Media and News
  'bbc.com': WebsiteCategory.MediaNews,
  'cnn.com': WebsiteCategory.MediaNews,
  'nytimes.com': WebsiteCategory.MediaNews,
  'theguardian.com': WebsiteCategory.MediaNews,
  'foxnews.com': WebsiteCategory.MediaNews,
  'aljazeera.com': WebsiteCategory.MediaNews,
  'reuters.com': WebsiteCategory.MediaNews,
  'npr.org': WebsiteCategory.MediaNews,
  'usatoday.com': WebsiteCategory.MediaNews,
  'washingtonpost.com': WebsiteCategory.MediaNews,
  'news.google.com': WebsiteCategory.MediaNews,
  'time.com': WebsiteCategory.MediaNews,
  'msn.com': WebsiteCategory.MediaNews,
  'telegraph.co.uk': WebsiteCategory.MediaNews,
  'forbes.com': WebsiteCategory.MediaNews,

  // Forums and Communities
  'forum.wordreference.com': WebsiteCategory.ForumsCommunities,
  'stackexchange.com': WebsiteCategory.ForumsCommunities,
  'quora.com': WebsiteCategory.ForumsCommunities,
  '4chan.org': WebsiteCategory.ForumsCommunities,
  'phpbb.com': WebsiteCategory.ForumsCommunities,
  'vbulletin.com': WebsiteCategory.ForumsCommunities,
  'neogaf.com': WebsiteCategory.ForumsCommunities,
  'gamefaqs.gamespot.com': WebsiteCategory.ForumsCommunities,
  'community.adobe.com': WebsiteCategory.ForumsCommunities,
  'boards.ie': WebsiteCategory.ForumsCommunities,
  'xenforo.com': WebsiteCategory.ForumsCommunities,
  'mybb.com': WebsiteCategory.ForumsCommunities,
  'warriorforum.com': WebsiteCategory.ForumsCommunities,
  'discourse.org': WebsiteCategory.ForumsCommunities,
  'fark.com': WebsiteCategory.ForumsCommunities,
};

export function getWebsiteCategory(domain: string) {
  const category = domainsByCategory[domain];

  return category ?? 'Other';
}

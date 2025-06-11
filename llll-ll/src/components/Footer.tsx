'use client';

interface FooterProps {}

export default function Footer({}: FooterProps) {
  const socialLinks = [
    { name: 'Instagram', url: 'https://instagram.com/kako_jun', icon: '📷' },
    { name: 'Note', url: 'https://note.com/kako-jun', icon: '📝' },
    { name: 'Zenn', url: 'https://zenn.dev/kako-jun', icon: '💡' },
    { name: 'X', url: 'https://x.com/kako_jun', icon: '🐦' },
    { name: 'Mixi2', url: 'https://mixi.jp/kako_jun', icon: '🌟' },
    { name: 'GitHub', url: 'https://github.com/kako-jun', icon: '⚡' },
  ];

  return (
    <footer className="relative bg-bg-secondary border-t border-border-color mt-12">
      <div className="container py-8">
        <div className="relative">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-30 pixel-border"
            style={{
              backgroundImage: 'url("/images/kanazawa-station.jpg")',
              height: '120px',
            }}
          />
          
          <div className="relative z-10 flex items-center h-[120px]">
            <div 
              className="w-20 h-24 bg-cover bg-center pixel-border ml-4 -mt-2"
              style={{
                backgroundImage: 'url("/images/kako-jun-avatar.jpg")',
              }}
            />
            
            <div className="ml-6 flex-1">
              <h3 className="text-sm glow mb-2">kako-jun</h3>
              <p className="text-xs text-text-secondary mb-3">
                Game & App Developer from Kanazawa
              </p>
              
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg hover:scale-110 transition-transform"
                    title={link.name}
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-6 pt-4 border-t border-border-color">
          <p className="text-xs text-text-secondary">
            © 2024 llll-ll. Built with Next.js and ♥
          </p>
        </div>
      </div>
    </footer>
  );
}
import './ContributorsWall.css';

interface Contributor {
  name: string;
  role: string;
  avatar?: string;
  link?: string;
}

const contributors: Contributor[] = [
  {
    name: '站点开发者',
    role: '全栈开发',
    link: 'https://github.com/yourname'
  }
];

const specialThanks = [
  { name: '东爱璃Lovely', desc: '没有狍子就没有这个站，就这么简单' },
  { name: 'PSPLive', desc: '靠谱的社团，狍子待着我们也放心' },
  { name: '所有秧歌星', desc: '每一个看直播、发弹幕、做二创的你，撑起了这个小站的意义' }
];

export default function ContributorsWall() {
  return (
    <div className="contributors-wall">
      {/* 开发者区域 */}
      <div className="contributors-section">
        <h3 className="section-title">
          <span className="title-icon">🛠️</span>
          开发者
        </h3>
        <div className="contributors-grid">
          {contributors.map((contributor, index) => (
            <a 
              key={index}
              href={contributor.link}
              target="_blank"
              rel="noopener noreferrer"
              className="contributor-card"
            >
              <div className="contributor-avatar">
                {contributor.avatar ? (
                  <img src={contributor.avatar} alt={contributor.name} />
                ) : (
                  <div className="avatar-placeholder">
                    {contributor.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="contributor-info">
                <span className="contributor-name">{contributor.name}</span>
                <span className="contributor-role">{contributor.role}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 特别感谢区域 */}
      <div className="contributors-section">
        <h3 className="section-title">
          <span className="title-icon">🌟</span>
          特别感谢
        </h3>
        <div className="thanks-list">
          {specialThanks.map((item, index) => (
            <div key={index} className="thanks-item">
              <span className="thanks-name">{item.name}</span>
              <span className="thanks-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 技术依赖 */}
      <div className="contributors-section">
        <h3 className="section-title">
          <span className="title-icon">🔧</span>
          技术依赖
        </h3>
        <div className="tech-deps">
          <a href="https://bilibili.com" target="_blank" rel="noopener noreferrer" className="tech-badge">
            Bilibili API
          </a>
          <a href="https://pages.cloudflare.com" target="_blank" rel="noopener noreferrer" className="tech-badge">
            Cloudflare Pages
          </a>
          <a href="https://astro.build" target="_blank" rel="noopener noreferrer" className="tech-badge">
            Astro
          </a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer" className="tech-badge">
            React
          </a>
        </div>
      </div>
    </div>
  );
}

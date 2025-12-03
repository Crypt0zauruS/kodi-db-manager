# 🎬 Kodi Database Manager

Modern desktop application for managing Kodi media databases with ease. Built with Tauri, Next.js 15, and Rust.

## ✨ Features

- 🎯 **Direct MySQL Connection** - Connect to your Kodi database directly
- 🔍 **TMDB Integration** - Search and import metadata from TMDB
- 🌍 **Multi-language** - French and English support (i18n ready)
- 🎨 **Modern UI** - Beautiful interface with TailwindCSS and dark mode
- 🚀 **Native Performance** - Tauri for lightweight native desktop app (~5MB)
- 🔒 **Secure** - Credentials stored securely with Tauri Store
- 📦 **Cross-platform** - Windows, macOS, and Linux support

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with SSG export
- **React 19** - Latest React version
- **TypeScript** - Type safety
- **TailwindCSS** - Modern styling
- **next-intl** - Internationalization (FR/EN)
- **Lucide Icons** - Beautiful icons

### Backend
- **Tauri 2.x** - Native desktop framework
- **Rust** - System programming language
- **SQLx** - Async MySQL driver
- **Reqwest** - HTTP client for TMDB API

## 📋 Prerequisites

- Node.js 22+ (you have v22.21.1)
- Rust 1.77.2+
- MySQL Kodi database (accessible via network)
- TMDB API key (free at https://www.themoviedb.org/settings/api)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Your Database

The app will prompt you to configure your database connection on first launch. Default values:
- Host: `192.168.0.10`
- Port: `3306`
- User: `xbmc`
- Password: `xbmc`
- Database: `MyVideos121`

### 3. Add Your TMDB API Key

Get your free API key from TMDB:
1. Go to https://www.themoviedb.org/settings/api
2. Request an API key (free)
3. Add it in the app settings

### 4. Run Development Mode

```bash
npm run tauri:dev
```

This will:
- Start Next.js dev server (port 3000)
- Compile Rust backend
- Launch the Tauri desktop app

## 📦 Building for Production

```bash
npm run tauri:build
```

This creates:
- **Windows**: `.exe` + installer in `src-tauri/target/release/bundle/`
- **macOS**: `.app` + `.dmg` in `src-tauri/target/release/bundle/`
- **Linux**: `.deb` / `.AppImage` in `src-tauri/target/release/bundle/`

## 🗂️ Project Structure

```
kodi-db-manager/
├── app/                          # Next.js frontend
│   ├── [locale]/                 # i18n routes
│   │   ├── components/           # React components
│   │   │   └── MovieCard.tsx     # Movie display card
│   │   ├── layout.tsx            # Locale-specific layout
│   │   └── page.tsx              # Home page (movies list)
│   ├── lib/
│   │   ├── tauri.ts              # Tauri IPC client
│   │   └── utils.ts              # Utilities (cn, etc.)
│   ├── globals.css               # Global styles + Tailwind
│   └── layout.tsx                # Root layout
├── messages/                     # i18n translations
│   ├── en.json                   # English
│   └── fr.json                   # French
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── commands.rs           # Tauri commands
│   │   ├── config.rs             # App state & config
│   │   ├── database.rs           # MySQL connection & queries
│   │   ├── models.rs             # Data structures
│   │   ├── tmdb.rs               # TMDB API client
│   │   ├── lib.rs                # Main Tauri setup
│   │   └── main.rs               # Entry point
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── i18n.ts                       # i18n config
├── middleware.ts                 # Next.js middleware (i18n)
├── next.config.mjs               # Next.js config (SSG)
├── tailwind.config.js            # Tailwind config
└── package.json                  # Node dependencies
```

## 🔧 Available Commands

### Tauri Commands (Rust → Frontend)

**Database:**
- `get_movies()` - Get all movies
- `get_movie_by_id(id)` - Get movie by ID
- `search_movies(query)` - Search movies
- `connect_database(config)` - Connect to database
- `test_database_connection()` - Test connection

**Config:**
- `get_config()` - Get app configuration
- `update_config(config)` - Update configuration

**TMDB:**
- `tmdb_search_movie(query, apiKey, language?)` - Search movies on TMDB
- `tmdb_get_movie_details(movieId, apiKey, language?)` - Get movie details

## 🎨 Customization

### Change Theme Colors

Edit `app/globals.css` to customize the color scheme:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Primary color */
  --background: 0 0% 100%;        /* Background */
  /* ... */
}
```

### Add New Languages

1. Create `messages/xx.json` (e.g., `de.json` for German)
2. Update `middleware.ts`:
```typescript
export default createMiddleware({
  locales: ['en', 'fr', 'de'],  // Add 'de'
  defaultLocale: 'en',
});
```

## 🔐 Security

- Database credentials are stored securely using Tauri Store
- TMDB API key is stored locally (never exposed)
- No external services (except TMDB API)
- All data stays on your local network

## 🐛 Troubleshooting

### Database Connection Failed

1. Check MySQL is accessible: `mysql -h 192.168.0.10 -u xbmc -p`
2. Verify firewall allows port 3306
3. Check credentials in app settings

### Build Errors

```bash
# Clean and rebuild
rm -rf node_modules .next out src-tauri/target
npm install
npm run tauri:build
```

### Rust Compilation Issues

Update Rust:
```bash
rustup update
```

## 📚 Next Steps (Future Features)

- [ ] **TV Shows Support** - Manage series like movies
- [ ] **Sources Manager** - Add/edit video sources
- [ ] **Backup/Restore** - Database snapshots before changes
- [ ] **Bulk Operations** - Edit multiple items at once
- [ ] **Multi-Kodi Sync** - Sync between multiple Kodi instances
- [ ] **Advanced Scraping** - Custom scrapers, manual metadata
- [ ] **Dark/Light Theme Toggle** - User preference
- [ ] **Settings Page** - UI for all configuration

## 🤝 Contributing

This is a personal project but contributions are welcome!

## 📄 License

MIT License - Feel free to use and modify

## 🙏 Credits

- Built with [Tauri](https://tauri.app/)
- Powered by [TMDB](https://www.themoviedb.org/)
- Designed for [Kodi](https://kodi.tv/)

---

**Made with ❤️ for easier Kodi management**

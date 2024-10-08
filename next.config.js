// ↓いつものlocalhost
// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   transpilePackages: ['crypto-js'],
//   webpack: config => {
//     config.externals.push('pino-pretty', 'lokijs', 'encoding')
//     return config
//   }
// }

// module.exports = nextConfig

// ↑いつものlocalhost

// ↓静的サイト
// const prefixPath = 'https://nft.naokomamablog.com/TestBaseMint/'

const prefixPath = 'https://zutomamogen.net/zutomamoPFP/mintsite/'
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  transpilePackages: ['crypto-js'],
  // @see https://beta.nextjs.org/docs/configuring/static-export#configuration
  output: "export",
  assetPrefix: prefixPath,
  reactStrictMode: true,
};

module.exports = nextConfig

// ↑静的サイト

// module.exports = {
//   exportTrailingSlash: true,
//   images: {
//     unoptimized: true,
//   },
// };


// /**
//  * @type {import('next').NextConfig}
//  */
// const nextConfig = {
//   output: 'export',
 
//   // Optional: Change links `/me` -> `/me/` and emit `/me.html` -> `/me/index.html`
//   // trailingSlash: true,
 
//   // Optional: Prevent automatic `/me` -> `/me/`, instead preserve `href`
//   // skipTrailingSlashRedirect: true,
 
//   // Optional: Change the output directory `out` -> `dist`
//   // distDir: 'dist',
// }
 
// module.exports = nextConfig
/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  webpack: config => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    return config
  }
}

module.exports = nextConfig
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
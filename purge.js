const { PurgeCSS } = require('purgecss');
const fs = require('fs');

(async () => {
    const purgecss = await new PurgeCSS().purge({
        content: ['index.html', 'assets/js/*.js'],
        css: ['assets/css/*.css'],
    });

    console.log('PurgeCSS result:', purgecss);

    if (purgecss[0] && purgecss[0].css) {
        fs.writeFileSync('build/style.css', purgecss[0].css);
        console.log('Purged CSS written to build/style.css');
    } else {
        console.log('No CSS was purged. Check your file paths and content.');
    }
})();
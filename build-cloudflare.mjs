import {mkdir,copyFile,cp,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const legacy=process.argv.includes('--vercel');
// Remain conservative by default. Only enable export links after the legacy production deployment is verified.
const pendingLegacy=!process.argv.includes('--legacy-ready');
const output=legacy?'dist-vercel':'dist';
await mkdir(path.join(root,output),{recursive:true});
let html=await readFile(path.join(root,'index.html'),'utf8');
// Only normal game and OGP URLs change. Explicit legacy export links must stay on Vercel.
if(!legacy){
html=html.replaceAll('content="https://torika-flower-site.vercel.app/','content="https://torika-flower-site.earthkey.workers.dev/');
html=html.replace('src="https://torika-flower-sfc.vercel.app/"','src="https://torika-flower-sfc.earthkey.workers.dev/"');
html=html.replace('class="mobile-note__play" href="https://torika-flower-sfc.vercel.app/"','class="mobile-note__play" href="https://torika-flower-sfc.earthkey.workers.dev/"');
if(!html.includes('src="https://torika-flower-sfc.earthkey.workers.dev/"'))throw Error('Missing new game iframe');
if(pendingLegacy)html=html.replace(/<aside class="migration-note"[\s\S]*?<\/aside>/,`<aside class="migration-note" aria-label="移行準備中"><p><strong>新しい公開先を検証中です</strong></p><p>旧サイトのセーブは自動では移りません。セーブ書き出し機能の旧サイトへの反映は確認待ちです。既存のセーブで遊ぶ方は、引き続き旧サイトをお使いください。</p><p><a href="https://torika-flower-site.vercel.app/#play">旧紹介サイトで続きを遊ぶ</a> ／ <a href="https://torika-flower-sfc.vercel.app/">旧ゲームを直接開く</a></p><p>新しく遊ぶ場合はこのページから始められます。旧公開の停止・削除は行っていません。</p></aside>`);
}
await writeFile(path.join(root,output,'index.html'),html);
await copyFile(path.join(root,'style.css'),path.join(root,output,'style.css'));
await cp(path.join(root,'assets'),path.join(root,output,'assets'),{recursive:true});
console.log(`Built ${legacy?'Vercel compatibility':'Cloudflare'} site: index.html, style.css and assets only.`);

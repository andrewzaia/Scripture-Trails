import {test,expect,open} from './fixtures.mjs';

test('only ESV passages have a Listen control, with reference and translation changes stopping audio',async({page})=>{
 await page.addInitScript(()=>{
  Object.defineProperty(HTMLMediaElement.prototype,'paused',{configurable:true,get(){return this.dataset.isPlaying!=='yes';}});
  HTMLMediaElement.prototype.play=function(){this.dataset.isPlaying='yes';this.dispatchEvent(new Event('playing'));return Promise.resolve();};
  HTMLMediaElement.prototype.pause=function(){this.dataset.isPlaying='no';this.dispatchEvent(new Event('pause'));};
 });
 await open(page,'reader','John 3:16');
 const button=page.locator('#reader-audio-button'),player=page.locator('#reader-audio');
 await expect(button).toBeVisible();await expect(button).toBeEnabled();
 await expect(button).toHaveAttribute('aria-label','Listen to ESV audio for John 3:16');
 await button.click();await expect(player).toHaveAttribute('src','/api/audio?q=John%203%3A16');
 await expect(button).toHaveAttribute('aria-pressed','true');
 await button.click();await expect(button).toHaveAttribute('aria-pressed','false');
 await button.click();await expect(button).toHaveAttribute('aria-pressed','true');
 await page.locator('#reader-translation').selectOption('NIV');
 await expect(button).toBeHidden();await expect(player).not.toHaveAttribute('src',/./);
 await page.locator('#reader-translation').selectOption('ESV');
 await expect(button).toBeVisible();await expect(button).toBeEnabled();
 await page.locator('#next-chapter').click();
 await expect(button).toHaveAttribute('aria-label','Listen to ESV audio for John 4');
 await expect(player).not.toHaveAttribute('src',/./);
 await button.click();await expect(player).toHaveAttribute('src','/api/audio?q=John%204');
 await page.locator('#reader-related-index').click();
 await expect(player).not.toHaveAttribute('src',/./);
});

test('media playback errors are accessible and not reported as success',async({page})=>{
 await page.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new Error('Synthetic media block'));};});
 await open(page,'reader','Psalms 23');
 const button=page.locator('#reader-audio-button');
 await expect(button).toBeEnabled();await button.click();
 await expect(page.locator('#reader-audio-status')).toContainText('could not play');
 await expect(button).toHaveAttribute('aria-pressed','false');
});

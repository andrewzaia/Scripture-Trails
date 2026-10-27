/** Relative visual strength from OpenBible community votes, not a probability of accuracy. */
export function maxDatasetVotes(links) {
 return links.reduce((max,link)=>{
  if(link?.type!=='dataset')return max;
  const votes=Number(link.votes);
  return Number.isFinite(votes)&&votes>max?votes:max;
 },0);
}
export function relativeVoteBars(votes,highestVotes) {
 const count=Number(votes),highest=Number(highestVotes);
 if(!Number.isFinite(count)||!Number.isFinite(highest)||count<=0||highest<=0)return 0;
 return Math.min(7,Math.max(1,Math.round(7*count/highest)));
}

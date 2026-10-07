import type { Attempt, Topic } from '@/content/types';
export function topicMastery(topic: Topic, attempts: Attempt[], now=Date.now()) {
  const records=attempts.filter(a=>a.topicId===topic.id).sort((a,b)=>a.completedAt.localeCompare(b.completedAt));
  const recent=records.slice(-10); const mastery=recent.length?recent.reduce((sum,a)=>sum+a.score,0)/recent.length:0;
  const confidence=recent.length?recent.reduce((sum,a)=>sum+({Low:0,Medium:0.5,High:1}[a.confidence]),0)/recent.length:0;
  const lastStudiedAt=records.at(-1)?.completedAt;
  const misses=records.filter(a=>a.score<2/3).length;
  const status=mastery>=0.8&&records.length>=3?'Strong':mastery>=0.5?'Developing':'Weak';
  const days=lastStudiedAt?Math.max(0,(now-Date.parse(lastStudiedAt))/86400000):14;
  const priority={CRITICAL:3,HIGH:2,MEDIUM:1,LOW:0}[topic.priority];
  const rank=priority*2+(1-mastery)*5+Math.min(misses,5)+Math.min(days,14)/7+(1-confidence);
  return {topic,attempts:records.length,mastery,status,misses,confidence,lastStudiedAt,rank,correctCount:records.filter(a=>a.score===1).length};
}
export function nextStudy(topics: Topic[],attempts: Attempt[],now=Date.now()) {
  return topics.map(t=>topicMastery(t,attempts,now)).sort((a,b)=>b.rank-a.rank||a.topic.reviewChapter-b.topic.reviewChapter);
}
export function missedIds(attempts: Attempt[]) {
  const latest=new Map<string,Attempt>();
  [...attempts].sort((a,b)=>a.completedAt.localeCompare(b.completedAt)).forEach(a=>latest.set(a.itemId,a));
  return new Set([...latest.values()].filter(a=>a.score<2/3).map(a=>a.itemId));
}

import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {inflateRawSync} from 'node:zlib';
import {fileURLToPath} from 'node:url';

export const DEFAULT_ARCHIVE=fileURLToPath(new URL('../sources/openbible/cross-references.zip',import.meta.url));
export const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const MAX_SOURCE_BYTES=20*1024*1024;

// Read the pinned, single-file OpenBible archive in memory, without filesystem extraction.
// Explicit TSV input remains available for other archive layouts.
export function readReferenceSource(path=DEFAULT_ARCHIVE){
 const bytes=readFileSync(path);
 if(bytes.length>MAX_SOURCE_BYTES)throw Error('Cross-reference source exceeds the size limit');
 let content=bytes,archiveSha256=null;
 if(/\.zip$/i.test(path)){
  if(bytes.length<30||bytes.readUInt32LE(0)!==0x04034b50)throw Error('Invalid cross-reference ZIP');
  const flags=bytes.readUInt16LE(6),method=bytes.readUInt16LE(8),compressed=bytes.readUInt32LE(18),size=bytes.readUInt32LE(22);
  const nameLength=bytes.readUInt16LE(26),extraLength=bytes.readUInt16LE(28),offset=30+nameLength+extraLength;
  const name=bytes.subarray(30,30+nameLength).toString('utf8');
  if(flags!==0||![0,8].includes(method)||name!=='cross_references.txt'||size>MAX_SOURCE_BYTES||offset+compressed>bytes.length)throw Error('Unsupported cross-reference ZIP layout; provide an extracted TSV instead');
  const compressedBytes=bytes.subarray(offset,offset+compressed);
  content=method===8?inflateRawSync(compressedBytes,{maxOutputLength:MAX_SOURCE_BYTES}):compressedBytes;
  if(content.length!==size)throw Error('Truncated cross-reference ZIP');
  archiveSha256=sha256(bytes);
 }
 const text=content.toString('utf8');
 const header=text.split('\n').find(line=>line.startsWith('From Verse\tTo Verse\tVotes'))||'';
 if(!header.startsWith('From Verse\tTo Verse\tVotes'))throw Error('Not an OpenBible cross-reference TSV');
 const sourceDate=header.match(/CC-BY (\d{4}-\d{2}-\d{2})/)?.[1]||null;
 return {text,sha256:sha256(content),archiveSha256,sourceDate};
}

export function readVendoredReferenceSource(){
 const source=readReferenceSource();
 const provenance=JSON.parse(readFileSync(new URL('../sources/openbible/provenance.json',import.meta.url),'utf8'));
 if(source.archiveSha256!==provenance.archiveSha256||source.sha256!==provenance.tsvSha256||source.sourceDate!==provenance.sourceDate)throw Error('Vendored OpenBible source differs from its reviewed provenance record');
 return source;
}

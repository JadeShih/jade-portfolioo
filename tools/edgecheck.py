import sys,glob,numpy as np
from PIL import Image
def edges(a):
  out={}
  for s in 'TBLR':
    b={'T':a,'B':a[::-1],'L':a.T,'R':a.T[::-1]}[s]
    m=b[:12].mean(1)  # per-line mean
    ref=m[6:12].mean(); k=0
    while k<5 and m[k]-ref>10: k+=1
    if 0<k<5: out[s]=(k,round(float(m[0]-ref)))
  return out
for f in sorted(glob.glob(sys.argv[1]+'/**/web-*.jpg',recursive=True)):
  e=edges(np.asarray(Image.open(f).convert('L')).astype(float))
  if e: print(f,e)

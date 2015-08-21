import gensim
import time

prev_time = time.clock()
def chkpt(str_):
    global prev_time
    cur_time = time.clock()
    print('{} seconds: {}'.format(cur_time - prev_time, str_))
    prev_time = cur_time

chkpt('Initialized chkpt()')
model = gensim.models.word2vec.Word2Vec.load_word2vec_format(
    'data/knowledge-vectors-skipgram1000.bin',
    binary=True,
)
chkpt('Loaded binary file')
#print(model['computer'])
#chkpt('Print raw numpy vector of a word')
print(model.most_similar(positive=['/en/brown']))
chkpt('Got most similar to "brown"')

from gensim.models.word2vec import Word2Vec

class Word2VecModel:
    def __init__(self):
        self.model = Word2Vec.load_word2vec_format(
            'data/GoogleNews-vectors-negative300.bin.gz',
            binary=True
        )

    def most_similar(self, word, num_results=20):
        """Returns a json-serializable list of (word, vector) pairs."""
        if word not in self.model:
            return []
        words = [
            result[0] for result in
            self.model.most_similar(
                positive=[word],
                topn=num_results,
            )
        ]
        return [{'word': word, 'vector': self.get_vector(word)}
                for word in words]

    def get_vectors(self, words):
        return [{'word': word, 'vector': self.get_vector(word)}
                for word in words
                if word in self.model]

    def get_vector(self, word):
        """Get a json-serializable vector representing the word."""
        return self.model[word].tolist()

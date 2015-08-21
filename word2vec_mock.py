import random

class Word2VecModelMock:

    def most_similar(self, word, num_results=20):
        """Returns a json-serializable list of (word, vector) pairs.

        Mock gives results for word 'spain'.
        """
        words = [
            result[0] for result in
            [(u'madrid', 0.724145233631134), (u'portugal', 0.6940689086914062), (u'barcelona', 0.692135751247406), (u'italy', 0.6797659397125244), (u'england', 0.6740610003471375), (u'europe', 0.6691802740097046), (u'diego', 0.6641592979431152), (u'carlos', 0.6588671803474426), (u'real_madrid', 0.6508796811103821), (u'sweden', 0.6494429111480713), (u'argentina', 0.6493310332298279), (u'ronaldo', 0.6442206501960754), (u'messi', 0.6405993700027466), (u'torres', 0.6380667090415955), (u'france', 0.6375300288200378), (u'brazil', 0.6314195990562439), (u'juve', 0.6309484839439392), (u'malta', 0.6299128532409668), (u'germany', 0.628757655620575), (u'usa', 0.6282230019569397)]
        ]
        return [(word, self.get_vector(word)) for word in words]

    def get_vectors(self, words):
        return [(word, self.get_vector(word))
                for word in words]

    def get_vector(self, word):
        return [random.random() for _ in range(300)]

from flask import Flask, jsonify
import logging

from word2vec import Word2VecModel

logging.basicConfig(filename='synonymvis.log', level=logging.DEBUG)
app = Flask(__name__)

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/api/most_similar/<word>')
def most_similar(word):
    """Returns a list of 20 most similar (word, vector) pairs."""
    return jsonify(results=app.w2v_model.most_similar(word))

@app.route('/api/get_vectors/<words>')
def get_vectors(words):
    """Returns (word, vector) pairs for the comma-delimited words."""
    return jsonify(results=app.w2v_model.get_vectors(words.split(',')))

if __name__ == "__main__":
    app.debug = False
    if app.debug:
        logging.info('Starting in debug mode...')
        from word2vec_mock import Word2VecModelMock
        app.w2v_model = Word2VecModelMock()
    else:
        logging.info('Loading word2vec model...')
        app.w2v_model = Word2VecModel()
    app.run(
        host='0.0.0.0',
        port=5000,
    )

# Synonym Visualizer
![pupil](http://i.imgur.com/sCpKEZK.png)

## Abstract
The goal of this project is to compare data collected from human versus machine-learning originated approaches. In particular, synonym sets are retrieved from [PanLex](http://panlex.org/), which are then drawn on a canvas based on a projection of their 300-dimensional vector representations, provided by a [_word2vec_](https://code.google.com/p/word2vec/) dataset.

## Data Sources
PanLex is a large lexical database, which aims to provide comprehensive translations between a multitude of languages. It is represented as a relational database, with tables that contain assertions about the meanings of expressions (lexemes). It current contains about 21 million expressions and about one billion translations. Synonyms can be derived from this data source by getting the list of expressions in a language with the same meaning. PanLex also provides the source of each meaning, e.g. Wiktionary. A given expression may be associated with multiple meanings, each of which has its own synonym set.
* API used: [lex](https://github.com/ahaas/lex)

[_word2vec_](https://code.google.com/p/word2vec/) is an implementation of a neural network machine-learning algorithm that computes vector representations of words. The representations are useful for many natural language processing tasks — this project utilizes these vector representions to render synonym sets spatially. The dataset used was trained from Google News using about 100 billion words, and contains vector representations for three million words and phrases.
* API used: [_custom_](https://github.com/ahaas/synonymvis/blob/master/server.py)

## Features
* Lines emanate from the query word to indicate synonym sets
  * All words of a synonym set will have the same colored line connecting them to the query word
* Position on the canvas is based on a projection of a their 300-dimensional vectors from _word2vec_
* Synonym sets can be hidden/shown using the table below the canvas
* The sources of each synonym set is shown
* Specific synonym sets can be highlighted by hovering over words
* The URL of a page can be shared at any time, and contains information including:
  * Queried word
  * Enabled synonym sets
  * Random seed used

## Design

### Synonym Set Lines
Each synonym set is denoted by lines emanating from the query word of the same color. The lines for one group all begin at the same point in a circle around the query word. The starting angle is computed by taking [atan2](https://en.wikipedia.org/wiki/Atan2) on the sum of normalized vectors of the synonyms relative to the query word. ([code](https://github.com/ahaas/synonymvis/blob/master/static/js/renderer.js#L18)) The colors of the lines are pre-determined for the largest ten synonym sets, and randomly generated for the remaining sets.

In order to produce a tree-like appearance, the lines are drawn as three-point Bézier curves with the control point radiating from the synonym set's starting angle and at a distance inversely proportional to the angular difference of the endpoint word. Thus, if the words in a synonym set are tightly clustered at the same angle relative to the query word, their lines will appear to diverge later because their control points will be farther away from the query word.

### Word Positions
The position of word on the canvas is determined by a [t-SNE](https://en.wikipedia.org/wiki/T-distributed_stochastic_neighbor_embedding) projection of their high-dimensional _word2vec_ vectors. The 2D vectors that result from the projection are then scaled in both the x and y direction, independently, to fill the HTML5 canvas.

Additionally, since some words may be very close to each other, a simple declustering algorithm is executed to push them apart. This ensures that they are readable. The algorithm simply chooses a random pair of distinct words, and nudges them apart slightly if they are too close. This is repeated the positions are determined stable; which is assumed if no pair of words has been too close for a large number of iterations. Although this would seemingly take an exponential amount of time in the worst case, in practice it never took more than a small fraction of a second.

### Architecture
Synonym sets were retreived in JSON format from the _lex_ API mentioned above. This project also includes a server for a JSON API that can be queried for vectors for individual words or arrays of words. The t-SNE projection, declustering, and other rendering is then done on the clientside in Javascript.

## Conclusions
The results of the visualizer are best seen for words that have multiple meanings, and for which those meanings all have synonyms. Then, the visualizer generally spatially separates words in different synonym groups fairly well, despite the fact that the data sources are very different in origin. This reinforces the usefulness of _word2vec_ for computing word similarities. Below are some examples.

![fair](http://i.imgur.com/XnFsojj.png)
![build](http://i.imgur.com/DCFcgxN.png)
![hide](http://i.imgur.com/4aoJV0z.png)

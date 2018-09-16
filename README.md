<h1>Lexical Density API</h1>

I created an API that counts the lexical density of the input body.

For testing purposes I created a MongoDB database that store a short list of nonlexical words. POST requests are used instead of GET because the API is reading req.body (in this case using GET method is not fully compliant with <a href="https://stackoverflow.com/questions/978061/http-get-with-request-body">HTTP specification</a>).

<i>On an http <code>POST/complexity</code> request the output will be the the lexical density of the body of the request.</i>

Example input: <code>This is very cool.</code>
In this case there are 2 nonlexical words : This + is, and 2 lexical : very + cool. The count of lexical words is 50%.
The output will be:
<code>
{data: {overall_ld: 0.5}}
</code>

<i>On <code>POST/complexity?mode=verbose</code> the output will also contain the lexical density pro sentence.</i>

Exaple input: <code>This is very cool. I like dogs and cats.</code> In this case the lexical words are: very, cool, like, dogs, cats
and the nonlexical: this, is, I, and. Where the output will be folowing: 
<code>
{data : {overall_ld: 0.56}{sentence_ld : [0.5, 0.6]}}
</code>

<h3>Testing with MongoDB in Docker</h3>

For testing purposes, it is possible to run the MongoDB in docker by executing following command and mounting the /data folder from the repository as volume (-v flag):

<code>docker run --name test-mongo -v /path/to/data/:/data/db -p 27017:27017 -d mongo</code>

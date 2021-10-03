# INTERACTIVE DATA VISUALIZER

![Project Logo](/images/project-logo.png)

## INTRODUCTION TO WEB APPLICATION

The **Interative Data Visualizer** is a Web App that encompasses 44000+ datasets in a way that is manageable by even amateur researchers. These data sets can be used as referances or for extracting valuable information. The need for access to credible and reliable sources of information is the aim of this application. 


## HOW WE CREATED IT.

To summarize it we tried to read all the data, find relationships, find nodes, establish connections. We discovered such connections by parsing them through python and found words or phrases that are similar. Then this data was added into Neo4J graphing database.

### BACK END

The server side of our project is written in Node.js and Typescript and uses the Express framework. The server handles API requests from the client and queries the Neo4j database. It has the following endpoints:

- /Node/getAllRelations - Gets all relations of a dataset
- /Node/info - Gets the data of a specific dataset
- /Node/search - Searches the database for matching datasets 

### FRONT END

The front end of our software is written in TypeScript with Vue JS framework.

### HOW TO WORK IT OUT!!

Once you click on Web App link you will find the details of a particular node. By clicking on *Veiw Relations* you will be redirected to a page with multiple data sets. The *Check it out!* button takes you to the link which contains the data set.

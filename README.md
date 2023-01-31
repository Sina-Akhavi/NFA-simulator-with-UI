# NFA-simulator-with-UI
This user interface program simulates NFA, draw an NFA, gets input and shows output by UI.

This program can draw for you an NFA. For drawing NFA, I have used Cytoscape library in JavaScript.
It can also check that the NFA accept or reject an input.


For using this app, double click on html file.

Enter states like this: a,b,c,d

Enter alphabet like this: 0,1

Enter transitions like this:


a,b,0,1

a,c,0

b,d,0,1

d,b,1

d,a,0

c,d,$


then click "generate NFA" button.


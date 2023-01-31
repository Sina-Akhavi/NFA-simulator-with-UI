
const container = document.getElementById('nfa-display');
const layout = {
  name: 'circle'
}

const style = [ 
  {
    selector: 'node',
    style: {
      'background-color': 'yellow',
      'label': 'data(label)'
    }
  },

  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': 'purple',
      'target-arrow-color': 'orange',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(weight)'
    }
  }
]

var nfa = null;
const applyButton = document.getElementById('apply-btn');
const clearButton = document.getElementById('clear-btn');
const acceptStartPart = document.getElementById('accep-start-part');
var statesInput = document.getElementById('states-label');
var alphaInput = document.getElementById('alpha-label');
var transitPartDiv = document.getElementById('transition-part');
var generateNFABtn = document.getElementById('generate-nfa');
var transitionsEl = document.getElementById('transitions-label');
var inputNFADiv = document.getElementById('input-nfa-part');
const computeBtn = document.getElementById('compute-btn');
const wordInputEl = document.getElementById('word');

// const acceptPartEl = document.getElementById('accept-part');
// const startPartEl = document.getElementById('start-part');

applyButton.addEventListener('click', apply);
clearButton.addEventListener('click', clear);
generateNFABtn.addEventListener('click', generateNFA);
computeBtn.addEventListener('click', computeResult);

function computeResult() {
  const inputWord = wordInputEl.value;
  const acceptOrReject = nfa.compute(inputWord);
  const pElResult = document.querySelector('.result');
  // pElResult.display = 'none';

  if (acceptOrReject) {
    pElResult.innerHTML = 'ACCEPTED';
    pElResult.style.color = 'green';
  } else {
    pElResult.innerHTML = 'REJECTED';
    pElResult.style.color = 'red';
  }
}


function apply() {
  const states = statesInput.value.split(',');
  const alpha = alphaInput.value.split(',');

  transitPartDiv.style.display = 'block';
  acceptStartPart.style.display = 'block';
  generateNFABtn.style.display = 'block';
  
  statesInput.disabled = true;
  alphaInput.disabled = true;
  
  generateAccepetPartInnerHTML();

}

function clear() {
  secondPartDiv.style.display = 'none';

  statesInput.value = '';
  alphaInput.value = '';

  statesInput.disabled = false;
  alphaInput.disabled = false;


}

function generateAccepetPartInnerHTML() {
  const states = statesInput.value.split(',');
  // console.log(states);
  
  html1 = `<h3 id="subtitles">Start & Accept States</h3>
    <p id="start-part" style="display: inline;">Start States:</p>`


  states.forEach((state, index) => {
    html1 += `<input type="radio" id="start${index}" name="start-states" value="${state}">
    <label for="start${index}">${state} &nbsp;&nbsp;</label>`;
  });

  html1 += `<br><p id="accept-part" style="display: inline;">Accep States: </p>`;

  states.forEach((state, index) => {
    html1 += `<input type="checkbox" id="accept${index}" name="start-states" value="${state}">
    <label for="accept${index}">${state} &nbsp;&nbsp;</label>`;
  });

  acceptStartPart.innerHTML = html1;
}

function generateNFA() {
  document.querySelectorAll('input[type="checkbox"]').forEach(inp => {
    inp.disabled = true;
  });

  document.querySelectorAll('input[type="radio"]').forEach(inp => {
    inp.disabled = true;
  });

  transitionsEl.disabled = true;  



  transitPartDiv.disabled = true;
  inputNFADiv.style.display = 'block';
  const states = statesInput.value.split(',');
  const radioBtns = document.querySelectorAll('input[type="radio"]');
  const checkBoxes = document.querySelectorAll('input[type="checkbox"]');
  const alpha = alphaInput.value.split(',');
  

  let startState = null;
  for (let btn of radioBtns) {
    if (btn.checked) {
      startState = btn.value;
    }
  }

  let acceptStates = [];
  for (let checkBox of checkBoxes) {
    if (checkBox.checked) {
      acceptStates.push(checkBox.value);
    }
  }
  

  const transitionStrings = transitionsEl.value;
  const transitions = transitionStrings.trim().split('\n');


  produceCytoNFA(states, startState, acceptStates, transitions);// works correctly

  const nfa = buildJSObjectNFA(states, startState, acceptStates, transitions, alpha);
  // console.log(nfa);
  
}

function buildJSObjectNFA(states, startState, acceptStates, transitions, alpha) {
  nfa = new NFA();
  // console.log(states, alpha);
  const nfaStates = [];
  states.forEach(state => {
    nfaStates.push(new NFAState(state, alpha)); // well
  });


  nfa.states = nfaStates;

  nfa.alphabet = alpha;

  transitions.forEach(transition => {
    transition = transition.split(',');
    
    const source = transition[0];
    const target = transition[1];
    const inputs = transition.slice(2, transition.length);

    const NFAState = nfa.findStateByName(source);
  
    inputs.forEach(input => {
      NFAState.transitions[input].add(target);
    });    
  
  });

  nfa.finalStates = acceptStates;
  nfa.startState = nfa.findStateByName(startState);

  return nfa;

}

class NFA {
  constructor() {
    const alphabet = [];
    let states = [];
    const finalStates = [];
    const startState = null;
  }

  findStateByName(stateLabel) {
    let output = null;

    this.states.forEach(state => {
      
      if (state.label == stateLabel) {
        // console.log('ihh');
        output = state;
      }

    })
    
    return output;
  }

  compute(w) {
    let computeBranches = new Set(this.startState.valueOf());
    this.handleEpsiloneTransitions(computeBranches, this.startState.valueOf());
    
    for (const letter of w) {
      let futureBranches = new Set();
      computeBranches.forEach(branch => {
        const objectBranch = this.findStateByName(branch);
        

        const newBranches = new Set(objectBranch.transitions[letter]);

        newBranches.forEach(newBranch => {
          futureBranches.add(newBranch); 
          this.handleEpsiloneTransitions(futureBranches, newBranch);
        });
      });

      computeBranches = futureBranches; 
    }

    const acceptOrReject = this.checkForAcceptOrReject(computeBranches);
    return acceptOrReject;

  }

  checkForAcceptOrReject(computeBranches) {
    for (let branch of computeBranches) {
      if (this.finalStates.includes(branch)) {
        return true;
      }
    }
    
    return false;
  }

  handleEpsiloneTransitions(futureBranches, newBranch) {
    const newBranchObj = this.findStateByName(newBranch);

    const epsTransits = newBranchObj.transitions['$'];
    if (epsTransits.length == 0) {
      return;
    }

    epsTransits.forEach(target => {
      futureBranches.add(target);
      this.handleEpsiloneTransitions(futureBranches, target);
    });

  }

}




function produceCytoNFA(states, startState, acceptStates, transitions) {
  // console.log(states);
  let elements = [];

  let tempNodes = [];

  states.forEach(state => {
    if (state == startState && acceptStates.includes(state)) {
      const node = { data: { id: state, label: `${state} start accept` } };
      tempNodes.push(node);  
    } else if (state == startState) {
      const node = { data: { id: state, label: `${state} start` } };
      tempNodes.push(node);  
    } else if (acceptStates.includes(state)) {
      const node = { data: { id: state, label: `${state} accept` } };
      tempNodes.push(node);
    } else {
      const node = { data: { id: state, label: state } };
      tempNodes.push(node);
    }

  });

  // console.log(tempNodes);
  

  let tempEdges = [];
  transitions.forEach(transition => {
    transition = transition.split(',');
    let weight = '';
    for (let i = 2; i < transition.length; i++) {
      weight += transition[i] + ',';
    }
    weight = weight.substring(0, weight.length - 1);


    const transit = { data: { id: `${transition[0]}${transition[1]}`, source: `${transition[0]}`
    , target: `${transition[1]}`, weight: weight } };

    tempEdges.push(transit);

  });

  elements = elements.concat(tempNodes).concat(tempEdges);


  // console.log(elements);


  var cy = cytoscape({
    container: container,

    autoungrabify: true,

    elements: elements,

    style: style,

    layout: layout,

  });

};








class NFAState {

  constructor(label, alpha) {
    this.label = label;

    // console.log();
    this.transitions = this.createInitialTransitions(alpha);
  }

  valueOf() {
    return this.label;
  }

  createInitialTransitions(alpha) {
    // console.log('hi');
    const transitions = {};
    alpha.forEach(symbol => {
      transitions[symbol] = new Set();
    });
    // transitions['$'] = {};
    transitions['$'] = new Set();

    return transitions;
  }

}

// // NFAState.prototype.valueOf = function() {
// //   return this.label;
// // };



// const a = new NFAState('a', [0,1]);
// const b = new NFAState('b', [0,1]);
// const c = new NFAState('c', [0,1]);
// const d = new NFAState('d', [0,1]);

// a.transitions = {0: new Set(['b', 'c']), 1: new Set(['b']), '$': new Set()};
// b.transitions = {0: new Set(['d']), 1: new Set(['d']), '$': new Set()};
// c.transitions = {0: new Set(), 1: new Set(), '$': new Set(['d'])};
// d.transitions = {0: new Set(['a']), 1: new Set(['b']), '$': new Set()};


// const nfa = new NFA();
// nfa.states = [a, b, c, d];
// nfa.alpha = ['0', '1'];

// nfa.startState = a;
// nfa.finalStates = ['a'];


// const acceptOrReject = nfa.compute('1000');
// console.log(acceptOrReject);




// const a = new NFAState('a', [0,1]);
// const b = new NFAState('b', [0,1]);
// const c = new NFAState('c', [0,1]);
// const d = new NFAState('d', [0,1]);

// a.transitions = {0: new Set(['b']), 1: new Set(['d']), '$': new Set()};
// b.transitions = {0: new Set(['c']), 1: new Set(['a']), '$': new Set(['c'])};
// c.transitions = {0: new Set(['d']), 1: new Set(['d']), '$': new Set()};
// d.transitions = {0: new Set(), 1: new Set(['b']), '$': new Set(['b'])};


// const nfa = new NFA();
// nfa.states = [a, b, c, d];
// nfa.alpha = ['0', '1'];

// nfa.startState = a;
// nfa.finalStates = ['b', 'c'];


// const acceptOrReject = nfa.compute('');
// console.log(acceptOrReject);




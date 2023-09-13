var bracketConfig = [
    { left: '{', right: '}' },
    { left: '[', right: ']' },
    { left: '(', right: ')' }
];

export default function isBracketsBalanced(subject) {
    var openingChars = [];
    var closingChars = [];
    bracketConfig.forEach( (item) => {
        openingChars.push(item.left);
        closingChars.push(item.right);
    });

    var stack = [];
    for (var i = 0, len = subject.length; i < len; i++) {
        var char = subject[i];
        var openIdx = openingChars.indexOf(char);
        var closeIdx = closingChars.indexOf(char);
        if (openIdx > -1) {
            stack.push(openIdx);
        } else if (closeIdx > -1) {            
            if (stack.length === 0) return false;
            let lastIdx = stack.pop();
            if(lastIdx !== closeIdx) return false;
        }
    }

    if (stack.length !== 0) return false;
    return true;     
}

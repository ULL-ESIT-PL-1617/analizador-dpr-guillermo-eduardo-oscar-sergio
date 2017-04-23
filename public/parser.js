  Object.constructor.prototype.error = function(message, t) {
    t = t || this;
    t.name = "SyntaxError";
    t.message = message;
    throw treturn;
  };

  RegExp.prototype.bexec = function(str) {
    var i, m;
    i = this.lastIndex;
    m = this.exec(str);
    if (m && m.index === i) {
      return m;
    }
    return null;
  };

  String.prototype.tokens = function() {
    var RESERVED_WORD, from, getTok, i, key, m, make, n, result, rw, tokens, value;
    from = void 0;
    i = 0;
    n = void 0;
    m = void 0;
    result = [];
    tokens = {
      WHITES: /\s+/g,
      ID: /[a-zA-Z_]\w*/g,
      NUM: /\b\d+(\.\d*)?([eE][+-]?\d+)?\b/g,
      STRING: /('(\\.|[^'])*'|"(\\.|[^"])*")/g,
      ONELINECOMMENT: /\/\/.*/g,
      MULTIPLELINECOMMENT: /\/[*](.|\n)*?[*]\//g,
      COMPARISONOPERATOR: /[<>=!]=|[<>]/g,
      ONECHAROPERATORS: /([=()&|;:,{}[\]])/g,
      ADDOP: /[+-]/g,
      MULTOP: /[*\/]/g
    };
    RESERVED_WORD = {
      "print": "PRINT",
      "if": "IF",
      "while": "WHILE",
      "function": "FUNCTION"
    };
    SYMBOL_TABLE = {};
    make = function(type, value) {
      return {
        type: type,
        value: value,
        from: from,
        to: i
      };
    };
    getTok = function() {
      var str;
      str = m[0];
      i += str.length;
      return str;
    };
    if (!this) {
      return;
    }
    while (i < this.length) {
      for (key in tokens) {
        value = tokens[key];
        value.lastIndex = i;
      }
      from = i;
      if (m = tokens.WHITES.bexec(this) || (m = tokens.ONELINECOMMENT.bexec(this)) || (m = tokens.MULTIPLELINECOMMENT.bexec(this))) {
        getTok();
      } else if (m = tokens.ID.bexec(this)) {
        rw = RESERVED_WORD[m[0]];
        if (rw) {
          result.push(make(rw, getTok()));
        } else {
          result.push(make("ID", getTok()));
        }
      } else if (m = tokens.NUM.bexec(this)) {
        n = +getTok();
        if (isFinite(n)) {
          result.push(make("NUM", n));
        } else {
          make("NUM", m[0]).error("Bad number");
        }
      } else if (m = tokens.STRING.bexec(this)) {
        result.push(make("STRING", getTok().replace(/^["']|["']$/g, "")));
      } else if (m = tokens.COMPARISONOPERATOR.bexec(this)) {
        result.push(make("COMPARISON", getTok()));
      } else if (m = tokens.ADDOP.bexec(this)) {
        result.push(make("ADDOP", getTok()));
      } else if (m = tokens.MULTOP.bexec(this)) {
        result.push(make("MULTOP", getTok()));
      } else if (m = tokens.ONECHAROPERATORS.bexec(this)) {
        result.push(make(m[0], getTok()));
      } else {
        throw "Syntax error near '" + (this.substr(i)) + "'";
      }
    }
    return result;
  };

  var parse = function(input) {
    var condition, consequent, expression, factor, lookahead, match, statement, statements, term, tokens, tree, loop, assign, procedure;
    tokens = input.tokens();
    lookahead = tokens.shift();
    match = function(t) {
      if (lookahead.type === t) {
        lookahead = tokens.shift();
        if (typeof lookahead === "undefined") {
          lookahead = null;
        }
      } else {
        throw ("Syntax Error. Expected " + t + " found '") + lookahead.value + "' near '" + input.substr(lookahead.from) + "'";
      }
    };

    // statements -> (statement ";")+
    statements = function() {
        var result = [];
        while (lookahead) {
            result.push(statement());
            match(";");
        }
        if (result.length === 1) {
            return result[0];
        } else {
            return result;
        }
    };

    // statement -> "if" condition "{" statements "}" |  "while" "(" condition ")" "{" statements "}" | "print" expression | assign
    statement = function() {
        var left, result, value;
        var right = [];
        if (lookahead && lookahead.type === "IF") {
            match("IF");
            left = condition();
            match("{");
            while (lookahead && lookahead.type != "}") {
               right.push(statement());
               match(";");
            }
            match("}");
            result = {
                type: "IF",
                condition: left,
                consequent: right
            };

        } else if (lookahead && lookahead.type === "WHILE") {
            match("WHILE");
            match("(");
            left = condition();
            match(")");
            match("{");
            while (lookahead && lookahead.type != "}") {
               right.push(statement());
               match(";");
            }
            match("}");
            result = {
                type: "WHILE",
                condition: left,
                right: right
            };
        } else if (lookahead && lookahead.type === "PRINT") {
            match ("PRINT");
            value = expression();
            if (value.value && value.value.type && value.value.type === "FUNCTION")
                throw "Expected expression or ID, but found FUNCTION near '" + input.substr(lookahead.from) + "'";
            result = {
                type: "PRINT",
                content: value
            };
        } else {
            result = assign();
        }

        return result;
    };

    // condition -> expression COMPARISON expression
    condition = function() {
        var left, right, result;
        left = expression();
        var operator = lookahead.value;
        match("COMPARISON");
        right = expression();
        result = {
            type: operator,
            left: left,
            right: right
        };
        return result;
    };

    // assign -> ID "=" assign | expression | function
    assign = function() {
        var left, right, value;
        var cont = [];
        var right;
        var result = {};

        if (lookahead && lookahead.type === "ID") {
            value = lookahead.value;
            left = {
                type: "ID",
                value: lookahead.value
            }
            match("ID");
            if (lookahead.value === "=") {
                match("=");
                right = assign();
                result = {
                    type: "ASSIGNMENT",
                    left: left,
                    right: right
                }
                SYMBOL_TABLE[value] = right;
            } else {
                result = SYMBOL_TABLE[value];
            }
        } else if (lookahead && lookahead.type === "FUNCTION") {
            result = procedure();
        } else {
            result = expression();
        }

        return result;
    };

    // procedure -> "FUNCTION" "(" "{" statements "}"
    procedure = function() {
        var content = [];
        match("FUNCTION");
        match("(");
        match(")");
        match("{");
        while (lookahead && lookahead.type != "}") {
            content.push(statement());
            match(";");
        }
        match("}");
        result = {
            type: "FUNCTION",
            content: content
        };
        return result;
    };

    expression = function() {
        var result, right, type;
        result = term();
        while (lookahead && lookahead.type === "ADDOP") {
            type = lookahead.value;
            match("ADDOP");
            right = term();
            result = {
                type: type,
                left: result,
                right: right
            };
        }
        return result;
    };

    term = function() {
        var result, right, type;
        result = factor();
        while (lookahead && lookahead.type === "MULTOP") {
            type = lookahead.value;
            match("MULTOP");
            right = factor();
            result = {
                type: type,
                left: result,
                right: right
            };
        }
        return result;
    };

    // factor -> NUM | ID | "(" expression ")"
    factor = function() {
        var result, value;
        result = null;
        if (lookahead.type === "NUM") {
            result = {
                type: "NUM",
                value: lookahead.value
            };
            match("NUM");
        } else if (lookahead.type === "ID") {
            result = {
                type: "ID",
                value: SYMBOL_TABLE[lookahead.value]
            }
            match("ID");
        } else if (lookahead.type === "(") {
            match("(");
            result = expression();
            match(")");
        } else {
            throw "Syntax Error. Expected number or identifier or '(' but found " + (lookahead ? lookahead.value : "end of input") + " near '" + input.substr(lookahead.from) + "'";
        }

        return result;
    };

    tree = statements(input);
    if (lookahead != null) {
        throw "Syntax Error parsing statements. " + "Expected 'end of input' and found '" + input.substr(lookahead.from) + "'";
    }
    return tree;
  };

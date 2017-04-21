# Analizador Descendente Predictivo Recursivo

## Descripción de la práctica

Diseñe un lenguaje de programación sencillo. Escriba un analizador sintáctico que genere un árbol de análisis abstracto para dicho lenguaje.

1. Escriba la gramática de manera que sea procesable por un ADPR. Puede usar los operadores `*` y `+` dentro de la gramática para indicar repeticiones.
2. Escriba el analizador sintáctico para dicho lenguaje. Deberá devolver el árbol de análisis sintáctico.
3. El lenguaje debe tener, **al menos**:
	* Declaraciones (aunque no tiene que ser necesariamente tipeado). Esto es, deberían poder declararse objetos como variables, constantes (opcional) y funciones.
	* Sentencias `if`.
	* Condiciones, como `a <= b`.
	* Asignaciones.
	* Alguna forma de bucle.
	* Funciones y llamadas a funciones.
4. La gramática deberá disponerse de forma que sea analizable por un PDR.
5. Escriba pruebas para el código desarrollado.

---
## Gramática

1. statements -> (statement ;)+
2. statement -> assign | "if" condition "{" statements "}" | loop
3. condition -> expression COMPARISIONOPERATOR expression
4. loop -> "while (" condition ") {" statements "}"
5. assign -> ID "=" assign | expression
6. expression -> term  (ADDOP term)*
7. term -> factor (MULOP factor)*
8. factor -> "(" expression ")" | NUM | ID

---
## Miembros del grupo

* [Óscar Darias Plasencia, alu0100892833](https://alu0100892833.github.io)
* [Eduardo de la Paz González, alu0100893267](https://alu0100893267.github.io)
* [Guillermo Esquivel González, alu0100881677](https://alu0100881677.github.io)
* [Sergio García de la Iglesia, alu0100892260](https://sergiogarciadli.github.io)

---

## Recursos empleados

### Recursos de clase

* [Campus PL1617: Práctica: Evaluar Analizador Descendente Predictivo Recursivo](https://campusvirtual.ull.es/1617/mod/assign/view.php?id=195888)
* [Descripción de la Práctica: Analizador Descendente Predictivo Recursivo](http://crguezl.github.io/pl-html/node26.html)
* [Analizadores Descendentes Recursivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/parsing/recursivodescendente/)

### Descripción del Código de la Práctica

1. [Eloquent JS: The Secret Life of Objects. Lying Out a Table](http://eloquentjavascript.net/06_object.html##h_36C2FHHi44)
2. [Repo original de esta práctica](https://github.com/ULL-ESIT-DSI-1617/oop-eloquentjs-example)

---

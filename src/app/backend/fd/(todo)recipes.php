<?php

//gestão de receitas - no frontend, é uma extensão de produtos (uma receita origina sempre um novo produto, composto por varios produtos)


/*

tabelas sql - recipes:

stamp
title
kcal
image
unidade de medida ([g]ramas, [ml]ilitros)
medida (500 [g / ml])
preço
tags (p.e. hidratos, carne, proteinas, ovos, etc...)

tabelas sql - recipemats:
stamp
recipestamp - receita on é aplicado
productstamp - produto aplicado
title
kcal
image
unidade de medida ([g]ramas, [ml]ilitros)
medida (500 [g / ml])
preço


*/
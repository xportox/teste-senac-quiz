# Quiz do SENAC
#### Teste proposto pelo SENAC para a vaga de Programador Jr. 

### Desafio 

Desenvolver uma página Web com Quiz nos conformes dos arquivos .AI enviados (disponíveis na pasta arquivos) e seguindo os requisitos descritos em tópicos abaixo:


> **Orientações para a construção da página**
>
> - A página possui dois temas com cores distintas (conforme pastas no arquivo compartilhado).
> - No topo da página deve conter um combobox no qual o usuário pode selecionar entre os dois temas para alternar entre as cores.
> - A página possui também um quiz.

> **Orientações específicas para o quiz**
> 
> - O quiz deve ter quatro questões.
> - Cada questão deve conter os seguintes elementos: enunciado, quatro
alternativas, uma imagem e um botão de confirmar resposta.
> - As imagens de cada questão estão disponíveis nos arquivos compartilhados.
> - Além disso, cada questão deve apresentar feedback positivo/negativo de acordo
com a resposta do usuário, por meio de ícones de “check” ou “X”.
> - Dentro desse feedback, deve haver um botão “próximo” que habilita a próxima
questão.
> - OBS: uma vez que o objetivo do teste é avaliar a programação em si, você
poderá utilizar textos genéricos (lorem ipsum) como placeholders das questões,
alternativas e feedbacks.

### Resultado

Desenvolvimento do zero de uma página _mobile-first_ utilizando HTML5, SASS com metodologia ITCSS/BEM e JS vanilla. A escolha do tema é persistente (localStorage). As questões são puxadas através de uma chamada assíncrona utilizado async/await e fetch API, requisitando o JSON disponível no meu [Gist com o conteúdo](https://gist.github.com/xportox/8e4444a309ceb4c89c27cce2ea5da674). A renderização da interface do quiz é feita a partir desses dados. 

**Teste realizado entre os dias 01/08/2021 e 05/08/2021**

[Visualizar teste](https://reverent-joliot-e10e0c.netlify.app/)

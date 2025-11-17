# ES-PI2-2025-103-G09
<p align="center">
  <img src="src/public/images/logo_NotaDez.png" width="300" alt="Logo Nota Dez">
</p>

O *NotaDez* é um sistema web desenvolvido para auxiliar docentes no controle pessoal de notas de seus estudantes. Diferente dos sistemas institucionais, o NotaDez é focado exclusivamente na organização, lançamento e exportação de notas, atendendo necessidades reais do professor de forma simples, rápida e eficiente.


## Visão Geral

O NotaDez é um sistema web projetado para simplificar o controle de notas realizado por docentes, permitindo organizar instituições, cursos, disciplinas, turmas, estudantes e avaliações de forma clara e centralizada.

Muitos professores utilizam planilhas para organizar notas, porém esse processo pode ser trabalhoso e suscetível a erros. O NotaDez oferece uma solução moderna e eficiente, com interface intuitiva, estrutura organizada e fluxo de trabalho que acompanha o processo real utilizado em sala de aula.

A aplicação funciona totalmente via navegador, podendo ser hospedada em servidor ou nuvem, e permite importar, registrar, calcular e exportar notas com facilidade.

# Funcionalidades Principais

## 🏫 Instituições, Cursos, Disciplinas e Turmas

Cadastro de instituições onde o docente leciona.
Cadastro de cursos e disciplinas com informações essenciais.
Criação de múltiplas turmas vinculadas às disciplinas.
Exclusão respeitando dependências para evitar perda inadvertida de dados.

## 👥 Cadastro e Importação de Estudantes

Cadastro manual de alunos em cada turma.
Importação de estudantes via arquivo CSV.
Identificação única por matrícula/RA e nome completo.
Tratamento automático de duplicidade para evitar inconsistências.

## 📝 Componentes de Nota

Cadastro de cada atividade avaliativa: provas, trabalhos, atividades etc.
Cada componente possui Nome, Sigla e Descrição.
Os componentes são vinculados à disciplina e aplicados às suas turmas.

## ✏️ Lançamento de Notas

Tabela organizada exibindo alunos × componentes de nota.
Edição prática de notas por componente.
Validação e persistência no banco de dados.

## 📊 Cálculo da Nota Final

Cálculo automático de nota final usando:
Média simples, ou Média ponderada definida pelo docente.

## 📁 Exportação de Dados

Exportação das notas completas da turma em CSV.
Somente permitida quando todas as notas estiverem preenchidas.

## 🧾 Registro de Alterações

Toda alteração de nota é registrada como log interno no banco.
Garante rastreabilidade e segurança no histórico das avaliações.

---
## 🛠️ Tecnologias Utilizadas

![HTML](https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
<img src="https://img.shields.io/badge/npm-CB3837.svg?style=flat&logo=npm&logoColor=white" alt="npm">
<br>

<img src="https://img.shields.io/badge/TypeScript-3178C6.svg?style=flat&logo=TypeScript&logoColor=white" alt="TypeScript">


---
### ⚙️ Instalação

Compile o ES_PI2_2025_T1_G07 a partir do código-fonte e instale as dependências.

1. *Clone o repositório:*

    sh
    ❯ git clone https://github.com/sfmonteiro/ES-PI2-2025-103-G09
    

2. *Entre no diretório do repositório:*
    
    ```sh
    ❯ cd ES_PI2_2025_103_G09
    ```

3. *:*Instale todas as dependencias

**Using [npm](https://www.npmjs.com/):**

```sh
❯ npm install
```

### 💻 Uso

Rode o projeto com:

**Usando [npm](https://www.npmjs.com/):**

```sh
npm start
```

### 🧪 Testes

Es_pi2_2025_103_g09 utiliza o framework de testes {_test_framework_}. Execute o conjunto de testes com:

**Usando [npm](https://www.npmjs.com/):**

```sh
npm test
```
```sh
Observação: Para o correto funcionamento de todo o projeto, é necessário configurar e utilizar chaves de APIs externas, como por exemplo a chave da Resend, responsável pelo envio de e-mails.
```
Antes de utilizar todas as funcionalidades do sistema, certifique-se de que todas as variáveis de ambiente necessárias estejam corretamente configuradas.


---


## 👥 Equipe de Desenvolvimento

- *Bruno Lobo de Jesus*  
- *Gabriel Figueira Albasini*  
- *Guilherme Mascarenhas Plácido*  
- *Marialvo Corrêa de Freitas Júnior*  
- *Sara Fernandes Monteiro*  

---

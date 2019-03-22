function LSICaptcha(opcoesUsuario)
{
    'use strict';

    // Extendendo escopo da instância
    let lsiCaptcha = this;

    // Opções padrão
    this.padrao = {
        // Elemento alvo para o captcha ser renderizado
        // Ex.: <div id="captchaAqui"></div>
        alvo: document.getElementById('captchaAqui'),

        // Endereço do webservice que gera o captcha
        webservice: 'captcha-ws.php',

        // Endereço do webservice que retorna a imagem do captcha
        img: 'captcha-img.php', // imagem+'?id='+cod

        // Callback em caso de erro
        // Parâmetro único com a mensagem do erro
        // Nota: não é erro do usuário digitar captcha errado, mas
        // erro de funcionalidade. Por exemplo: webservice offline.
        erro: function(msg){
            console.log(
                'LSICaptcha erro'
                +(typeof msg == 'string' ? ': '+msg : '')
            );
        }
    }

    /*
     * captchaStatus
     * 0: instanciado - valor inicial
     * 1: criação ou renovação em andamento
     * 2: criado e pronto (mesmo em caso de erro)
     */
    this.captchaStatus = 0;

    this.criar = function()
    {
        // container
        lsiCaptcha.container = document.createElement('div');
        lsiCaptcha.container.classList.add('lsi-captcha');

        // inpId
        lsiCaptcha.inpId = document.createElement('input');
        lsiCaptcha.inpId.setAttribute('type', 'hidden');
        lsiCaptcha.inpId.setAttribute('name', 'captchaId');
        lsiCaptcha.container.appendChild(lsiCaptcha.inpId);

        // dvCont
        lsiCaptcha.dvCont = document.createElement('div');
        lsiCaptcha.container.appendChild(lsiCaptcha.dvCont);

        // dvStatus
        lsiCaptcha.dvStatus = document.createElement('div');
        lsiCaptcha.dvStatus.classList.add('mostraLoading');
        lsiCaptcha.dvCont.appendChild(lsiCaptcha.dvStatus);

        // capImg (200x80)
        lsiCaptcha.capImg = document.createElement('img');

        lsiCaptcha.capImg.onload = function() {
            lsiCaptcha.capImg.classList.add('mostra');
            lsiCaptcha.dvStatus.classList.remove('mostraLoading');
            if (lsiCaptcha.capImg.classList.contains('esconde'))
                lsiCaptcha.capImg.classList.remove('esconde');
            lsiCaptcha.captchaStatus = 2;
        }

        lsiCaptcha.dvCont.appendChild(lsiCaptcha.capImg);

        // linkRenovar
        lsiCaptcha.linkRenovar = document.createElement('a');
        lsiCaptcha.linkRenovar.setAttribute('href', 'javascript: void(0);');
        lsiCaptcha.linkRenovar.innerText = 'Gerar novo código';
        lsiCaptcha.container.appendChild(lsiCaptcha.linkRenovar);

        // adiciona ao HTML
        lsiCaptcha.alvo.appendChild(lsiCaptcha.container);

        /*
         * - consome o ws;
         * - preenche o input;
         * - e retorna a imagem do captcha
         ************************************/
        lsiCaptcha.renova();

        // evento 'click' no link para renovação
        lsiCaptcha.linkRenovar.addEventListener(
            'click',
            function(){
                if (lsiCaptcha.captchaStatus === 1)
                    return false;
                else
                    lsiCaptcha.renova();
            },
            false
        );
    }

    this.renova = function()
    {

        if (lsiCaptcha.captchaStatus === 1) {
            alert('Em andamento. Aguarde.');
            return false;
        }

        lsiCaptcha.captchaStatus = 1;

        if (lsiCaptcha.dvStatus.classList.contains('mostraErro'))
            lsiCaptcha.dvStatus.classList.remove('mostraErro');

        lsiCaptcha.dvStatus.classList.add('mostraLoading');
        if (lsiCaptcha.capImg.classList.contains('mostra')) {
            lsiCaptcha.capImg.classList.add('esconde');
            lsiCaptcha.capImg.classList.remove('mostra');
        }

        let ajax = new XMLHttpRequest();

        ajax.open(
            'get',
            (
                lsiCaptcha.webservice
                +((/\?/).test(lsiCaptcha.webservice) ? "&_lsi=" : "?_lsi=")
                +(new Date()).getTime()
            )
        );

        ajax.onreadystatechange = function() {
            if (ajax.readyState === 4) {
                if (ajax.status < 400) {
                    let data = JSON.parse(ajax.responseText);

                    if (data.sucesso === true) {
                        lsiCaptcha.execSucesso(data.resultado);
                    } else
                        lsiCaptcha.execErro(
                            'O servidor retornou uma resposta inválida.'
                        );
                } else
                    lsiCaptcha.execErro(ajax.statusText);
            }
        }

        ajax.send(null);
    }

    this.execSucesso = function(cod)
    {

        lsiCaptcha.capImg.setAttribute('src', lsiCaptcha.img+'?id='+cod);
        lsiCaptcha.inpId.setAttribute('value', cod);
    }

    this.execErro = function(msg)
    {

        if (lsiCaptcha.dvStatus.classList.contains('mostraLoading'))
            lsiCaptcha.dvStatus.classList.remove('mostraLoading');

        lsiCaptcha.dvStatus.classList.add('mostraErro');

        setTimeout(
            function() {
                if (typeof lsiCaptcha.erro === 'function')
                    lsiCaptcha.erro(msg);
                else
                    console.log('LSICaptcha erro: '+msg);
            },
            300
        );

        lsiCaptcha.captchaStatus = 2;
    }

    // Preparação das opções
    for (let opcao in this.padrao) {
        this[opcao] = this.padrao[opcao];
    }
    if (typeof opcoesUsuario == 'object') {
        for (let opcao in opcoesUsuario) {
            this[opcao] = opcoesUsuario[opcao];
        }
    }

    // Renderização do captcha
    lsiCaptcha.criar();
}

/*
 *
 * ESTRUTURA DO CAPTCHA
 *
 * === container
 * <div class="lsi-captcha">
 *
 *     === inpId
 *     <input
 *         type="hidden"
 *         name="captchaId"
 *         value="<<<ID DO CAPTCHA>>>">
 *
 *     === dvCont
 *     <div>
 *
 *         === dvStatus
 *         <div class="[mostraLoading[, mostraErro]]"></div>
 *
 *         === capImg
 *         <img
 *             src="<<<URL DA IMG>>>?id=<<<ID DO CAPTCHA>>>"
 *             class="[mostra [esconde]]">
 *
 *     </div>
 *
 *     === linkRenovar
 *     <a href="javascript: void(0);">
 *         Gerar novo código
 *     </a>
 *
 * </div>
 *
 **************************************************/

function LSICaptcha()
{
    /*
     * captchaStatus
     * 0: instanciado - valor inicial
     * 1: criação ou renovação em andamento
     * 2: criado e pronto (mesmo em caso de erro)
     */
    this.captchaStatus = 0;

    this.criar = function(alvo, ws, imgSrc)
    {
        let lsiCaptcha = this;

        if (lsiCaptcha.captchaStatus !== 0)
            return false;

        lsiCaptcha.webservice = ws;
        lsiCaptcha.imgLink = imgSrc;

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

        // img (200x80)
        lsiCaptcha.img = document.createElement('img');

        lsiCaptcha.img.onload = function() {
            lsiCaptcha.img.classList.add('mostra');
            lsiCaptcha.dvStatus.classList.remove('mostraLoading');
            if (lsiCaptcha.img.classList.contains('esconde'))
                lsiCaptcha.img.classList.remove('esconde');
            lsiCaptcha.captchaStatus = 2;
        }

        lsiCaptcha.dvCont.appendChild(lsiCaptcha.img);

        // linkRenovar
        lsiCaptcha.linkRenovar = document.createElement('a');
        lsiCaptcha.linkRenovar.setAttribute('href', 'javascript: void(0);');
        lsiCaptcha.linkRenovar.innerText = 'Gerar novo código';
        lsiCaptcha.container.appendChild(lsiCaptcha.linkRenovar);

        // adiciona ao HTML
        alvo.appendChild(lsiCaptcha.container);

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
        let lsiCaptcha = this;

        if (lsiCaptcha.captchaStatus === 1) {
            alert('Em andamento. Aguarde.');
            return false;
        }

        lsiCaptcha.captchaStatus = 1;

        if (lsiCaptcha.dvStatus.classList.contains('mostraErro'))
            lsiCaptcha.dvStatus.classList.remove('mostraErro');

        lsiCaptcha.dvStatus.classList.add('mostraLoading');
        if (lsiCaptcha.img.classList.contains('mostra')) {
            lsiCaptcha.img.classList.add('esconde');
            lsiCaptcha.img.classList.remove('mostra');
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
        let lsiCaptcha = this;

        lsiCaptcha.img.setAttribute('src', lsiCaptcha.imgLink+'?id='+cod);
        lsiCaptcha.inpId.setAttribute('value', cod);
    }

    this.execErro = function(msg)
    {
        let lsiCaptcha = this;

        if (lsiCaptcha.dvStatus.classList.contains('mostraLoading'))
            lsiCaptcha.dvStatus.classList.remove('mostraLoading');

        lsiCaptcha.dvStatus.classList.add('mostraErro');

        setTimeout(
            function() {
                if (typeof lsiCaptcha.onerro === 'function')
                    lsiCaptcha.onerro(msg);
                else
                    console.log('LSICaptcha erro: '+msg);
            },
            300
        );

        lsiCaptcha.captchaStatus = 2;
    }
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
 *         === img
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

function LSICaptcha()
{
    this.status = 0;

    this.criar = function(alvo, ws, imgSrc)
    {
        let lsiCaptcha = this;
        lsiCaptcha.webservice = ws;
        lsiCaptcha.imgLink = imgSrc;

        // container
        lsiCaptcha.container = document.createElement('div');
        lsiCaptcha.container.classList.add('lsi-captcha');

        // inpId
        lsiCaptcha.inpId = document.createElement('input');
        lsiCaptcha.inpId.setAttribute('type', 'text');
        lsiCaptcha.inpId.setAttribute('name', 'captchaId');
        lsiCaptcha.container.appendChild(lsiCaptcha.inpId);

        // dvCont
        lsiCaptcha.dvCont = document.createElement('div');
        lsiCaptcha.container.appendChild(lsiCaptcha.dvCont);

        // img (200x80)
        lsiCaptcha.img = document.createElement('img');

        lsiCaptcha.img.onload = function() {
            lsiCaptcha.img.classList.add('mostra');
            if (lsiCaptcha.img.classList.contains('esconde'))
                lsiCaptcha.img.classList.remove('esconde');
        }

        lsiCaptcha.dvCont.appendChild(lsiCaptcha.img);

        // linkRenovar
        lsiCaptcha.linkRenovar = document.createElement('a');
        lsiCaptcha.linkRenovar.setAttribute('href', 'javascript: void(0);');
        lsiCaptcha.linkRenovar.innerText = 'Gerar novo código';
        lsiCaptcha.linkRenovar.addEventListener(
            'click',
            function(){
                lsiCaptcha.renova();
            },
            false
        );
        lsiCaptcha.container.appendChild(lsiCaptcha.linkRenovar);

        // adiciona ao HTML
        alvo.appendChild(lsiCaptcha.container);

        /*
         * - consome o ws;
         * - preenche o input;
         * - e retorna a imagem do captcha
         ************************************/
        lsiCaptcha.renova();

    }

    this.renova = function()
    {
        let ajax = new XMLHttpRequest();
        let lsiCaptcha = this;

        if (lsiCaptcha.img.classList.contains('mostra')) {
            lsiCaptcha.img.classList.add('esconde');
            lsiCaptcha.img.classList.remove('mostra');
        }

        ajax.open(
            'get',
            (
                lsiCaptcha.webservice
                +((/\?/).test(lsiCaptcha.webservice) ? "&_lsi=" : "?_lsi=")
                +(new Date()).getTime()
            )
        );

        ajax.onreadystatechange = function() {
            if (
                ajax.readyState === 4
                && ajax.status >= 200
                && ajax.status <= 400
            ) {
                let data = JSON.parse(ajax.responseText);
                if (data.sucesso === true) {
                    lsiCaptcha.renovaExec(data.resultado);
                } else
                    console.log('Erro ao renovar captcha!');
            }
        }

        ajax.send(null);
    }

    this.renovaExec = function(cod)
    {
        this.img.setAttribute('src', this.imgLink+'?id='+cod);
        this.inpId.setAttribute('value', cod);
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
 *         value="[ID DO CAPTCHA]">
 *
 *     === dvCont
 *     <div>
 *
 *         === img
 *         <img src="captcha?id=<?php
 *             echo $this->view->captchaId;
 *         ?>">
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

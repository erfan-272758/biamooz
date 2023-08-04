/* eslint-disable*/
const axios = require('axios');
import autoSender from '../helpers/autoQuerySender';
import { createLoader, removeLoader } from '../helpers/loadingMaker';
import errorHandler from '../helpers/error';
import successHandler from '../helpers/success';
import error from '../helpers/error';

const container = document.querySelector('#b-message');
if (container) {
  const URL = '/api/v1/message';
  const mode = container.dataset.mode === 'user' ? 'advance' : 'normal';

  class Message {
    async fetch() {
      const { data } = await axios({
        url: URL,
        method: 'GET',
      });
      return data.data;
    }

    makeup(data) {
      const footer =
        mode === 'normal'
          ? ''
          : `
      <div class="notif-plus-container">
        <textarea class="notif-plus-text" placeholder="پیام خود به ما را در این کادر بنویسید"></textarea>    
        <svg class="notif-plus-button notif-tool" data-act="plus">
                <use xlink:href="/img/icons.svg#icon-plus-circle"></use>
            </svg>
      </div>
        `;

      if (!data || !data.length)
        return mode === 'normal'
          ? `<div class="empty-result">
          <i class="fas fa-sticky-note"></i>
          <h1>پیامی یافت نشد</h1>
      </div>`
          : footer;

      const body = data
        .map(
          (mess) =>
            `
                <div class="notif-item-container" data-id="${mess._id}">
                ${
                  mode === 'advance'
                    ? ''
                    : `  <div class = "notif-creator-container">
                <img src="/${mess.sender.photo || '-'}"
                class="notif-creator-img"
                alt="عکس"
              />
                <h1 class="notif-creator-name" >${mess.sender.firstName} ${
                        mess.sender.lastName
                      }</h1>
            </div>
`
                }
                
                  <div class="notif-message-container message-message-container-${mode}">
                      <p class="notif-message-p">
                      ${mess.message}
                      </p>
                      ${
                        mode === 'advance'
                          ? `<textarea class="notif-message-input none">${mess.message}</textarea>`
                          : ''
                      }
                  </div>
                  ${
                    mode === 'advance'
                      ? `
                  <div class="notif-tools">
                      <div class="notif-edit notif-tool" data-act="edit">
                          <svg>
                              <use xlink:href="/img/icons.svg#icon-edit"></use>
                          </svg>
                      </div>
                      <div class="notif-close notif-tool none" data-act="close">
                        <svg class="rotate">
                            <use xlink:href="/img/icons.svg#icon-plus-circle"></use>
                        </svg>   
                      </div>
                      <div class="notif-confirm notif-tool none" data-act="confirm">
                        <svg>
                            <use xlink:href="/img/icons.svg#icon-check-circle"></use>
                        </svg>   
                      </div>
                      <div class="notif-delete notif-tool" data-act="delete">
                          <svg>
                              <use xlink:href="/img/icons.svg#icon-trash"></use>
                          </svg>
                      </div>
                  </div>
                  `
                      : ''
                  }
                </div>`
        )
        .join('');

      return `${body}${footer}`;
    }

    create(data) {
      const body = this.makeup(data);
      container.innerHTML = '';
      container.insertAdjacentHTML('afterbegin', body);
    }

    async sendQuery() {
      try {
        this.create(await this.fetch());
      } catch (err) {
        error(err, container, 1500);
      }
    }
  }

  autoSender(new Message(), '#b-message');

  const plusTool = async (tool) => {
    createLoader(tool.parentElement);
    try {
      const message =
        tool.parentElement.querySelector('.notif-plus-text').value;
      await axios({
        url: URL,
        method: 'POST',
        data: {
          message,
        },
      });
      new Message().sendQuery();
      successHandler('با موفقیت افزوده شد', container, 1500);
    } catch (err) {
      removeLoader(tool.parentElement);
      errorHandler(err, container);
    }
  };
  const editTool = async (tool) => {
    tool.classList.add('none');
    tool.parentElement.querySelector('.notif-close').classList.remove('none');
    tool.parentElement.querySelector('.notif-confirm').classList.remove('none');
    const [messagP, messageIn] = tool
      .closest('.notif-item-container')
      .querySelector('.notif-message-container').children;
    messagP.classList.add('none');
    messageIn.classList.remove('none');
  };
  const closeTool = async (tool) => {
    tool.classList.add('none');
    tool.parentElement.querySelector('.notif-edit').classList.remove('none');
    tool.parentElement.querySelector('.notif-confirm').classList.add('none');
    const [messagP, messageIn] = tool
      .closest('.notif-item-container')
      .querySelector('.notif-message-container').children;
    messagP.classList.remove('none');
    messageIn.classList.add('none');
  };

  const confirmTool = async (tool) => {
    const [, messageIn] = tool
      .closest('.notif-item-container')
      .querySelector('.notif-message-container').children;
    const message = messageIn.value;

    createLoader(tool.parentElement);
    try {
      const { id } = tool.closest('.notif-item-container').dataset;
      await axios({ url: `${URL}/${id}`, method: 'PUT', data: { message } });
      new Message().sendQuery();
      successHandler('با موفقیت تغییر پیدا کرد', container, 1500);
    } catch (err) {
      removeLoader(tool.parentElement);
      errorHandler(err, container);
    }
  };

  const deleteTool = async (tool) => {
    createLoader(tool.parentElement);
    try {
      const { id } = tool.closest('.notif-item-container').dataset;
      await axios({ url: `${URL}/${id}`, method: 'DELETE' });
      new Message().sendQuery();
      successHandler('با موفقیت حذف شد', container, 1500);
    } catch (err) {
      removeLoader(tool.parentElement);
      errorHandler(err, container);
    }
  };

  container.addEventListener('click', (e) => {
    const tool = e.target.closest('.notif-tool');
    if (!tool) return;

    switch (tool.dataset.act) {
      case 'plus':
        plusTool(tool);
        break;
      case 'edit':
        editTool(tool);
        break;
      case 'close':
        closeTool(tool);
        break;
      case 'confirm':
        confirmTool(tool);
        break;
      case 'delete':
        deleteTool(tool);
        break;
    }
  });
}

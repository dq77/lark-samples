import * as Lark from '@larksuiteoapi/node-sdk';

const baseConfig = {
  appId: 'cli_a8a69dcc7a20501c',
  appSecret: '4JrZ1NOG0XshbAX8qeeuLdRF2cwr3ikh',
  domain: 'https://open.feishu.cn',
};

/**
 * 创建 LarkClient 对象，用于请求OpenAPI, 并创建 LarkWSClient 对象，用于使用长连接接收事件。
 */
const client = new Lark.Client(baseConfig);
const wsClient = new Lark.WSClient(baseConfig);

const eventDispatcher = new Lark.EventDispatcher({}).register({
  /**
   * 注册接收消息事件，处理接收到的消息。
   * https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/events/receive
   */
  'im.message.receive_v1': async (data) => {
    const {
      message: { chat_id, content, message_type, chat_type },
    } = data;

    let responseText = '';

    try {
      if (message_type === 'text') {
        responseText = JSON.parse(content).text;
      } else {
        responseText = '解析消息失败，请发送文本消息';
      }
    } catch (error) {
      // 解析消息失败，返回错误信息。
      responseText = '解析消息失败，请发送文本消息';
    }

    if (chat_type === 'p2p') {
      /**
       * 使用SDK调用发送消息接口。
       * https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/reference/im-v1/message/create
       */
      await client.im.v1.message.create({
        params: {
          receive_id_type: 'chat_id', // 消息接收者的 ID 类型，设置为会话ID。
        },
        data: {
          receive_id: chat_id, // 消息接收者的 ID 为消息发送的会话ID。
          content: JSON.stringify({ text: `收到你发送的消息:${responseText}\nReceived message: ${responseText}` }),
          msg_type: 'text', // 设置消息类型为文本消息。
        },
      });
    }
  },
});

/**
 * 启动长连接，并注册事件处理器。
 */
wsClient.start({ eventDispatcher });

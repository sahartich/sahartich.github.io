THIS CODE WAS WRITTEN AND IS CURRENTLY MAINTAINED BY SAHAR TICHOVER BUT IS OPEN SOURCE

----------------------

all parameters that must be kept up-to-date are listed in the config.json file except for:
form_url and cors_url which are found inside the main function of the script.js file

Please note:
regarding bot_name, in hebrew it must contain its' text, in arabic it must equal it
regarding age_prompt, there is also an interactive selection-based age prompt when accessing from some platforms

----------------------

The code outputs the following parameters:

agent_name --- The name of the agent handling the conversation.
manager_name --- The name of the manager associated with the conversation.
manager_email --- The email address of the manager associated with the conversation.
visitor_name --- The name of the visitor engaging in the conversation.
skill --- The skill/medium used by the visitor (e.g., WhatsApp, Web).
chat_start_date --- The date when the chat started, formatted as 'DD/MM/YYYY'.
chat_start_time --- The time when the chat started, formatted as 'HH:mm:ss'.
conversation_id --- The unique ID of the conversation session.
agent_reply_time --- The time in which the agent first replied to the visitor.
chat_total_time --- The total duration of the chat session in minutes.
nickname --- The nickname provided by the visitor during the chat.
age --- The age of the visitor.
ip_address --- The IP address of the visitor, if available.
phone_number --- The phone number of the visitor, if available.
port --- The port associated with the visitor's connection, related to their IP address.
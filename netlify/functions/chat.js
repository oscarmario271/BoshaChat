export async function handler(event) {
  try {
    // 👇 SAFE parsing (won’t crash)
    const body = event.body ? JSON.parse(event.body) : {};

    if (!body.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No message provided" })
      };
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + process.env.HF_TOKEN,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:fastest",
          messages: [
            {
              role: "user",
              content: body.message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("HF FULL RESPONSE:", JSON.stringify(data, null, 2));

    let reply =
      data.choices?.[0]?.message?.content ||
      data.choices?.[0]?.text ||
      data.generated_text ||
      JSON.stringify(data);

    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: reply || "No response 😅"
      })
    };

  } catch (err) {
    console.error("ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message
      })
    };
  }
}

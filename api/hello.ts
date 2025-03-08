// import type { VercelRequest, VercelResponse } from '@vercel/node'

// export default function handler(req: VercelRequest, res: VercelResponse) {
//   const { name = 'World' } = req.query
//   return res.json({
//     message: `Hello ${name}!`,
//   })
// }

const express = require("express")
const app = express();

app.get("/:username", (req, res) => {
    console.log(req);

    fetch(`https://api.mojang.com/users/profiles/minecraft/${req.params.username}`).then((uuidResponse) => {
        uuidResponse.json().then((uuidData) => {
            fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuidData.id}`).then((profileResponse) => {
                profileResponse.json().then((profileData) => {
                    profileDataDecoded = JSON.parse(Buffer.from(profileData.properties[0].value, "base64").toString());

                    fetch(profileDataDecoded.textures.SKIN.url).then((skinResponse) => {
                        skinResponse.arrayBuffer().then((skinBuffer) => {
                            imageDataURL = `data:image/png;base64,${Buffer.from(skinBuffer).toString('base64')}`;
                            res.send({
                                pixelsToSub: profileDataDecoded.textures.SKIN.metadata?.model == "slim" ? "1" : "0",
                                image: imageDataURL
                            });
                        });
                    });
                });
            });
        });
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const express = require("express")
const cors = require("cors");
const app = express();

app.use(cors());

app.get("/api/:username", (req, res) => {
    fetch(`https://api.mojang.com/users/profiles/minecraft/${req.params.username}`).then((uuidResponse) => {
        uuidResponse.json().then((uuidData) => {
            fetch(`https://sessionserver.mojang.com/session/minecraft/profile/${uuidData.id}`).then((profileResponse) => {
                if (!profileResponse.ok) {
                    res.status(404);
                    res.send({ error: "Player doesn't exist" });
                    return;
                };
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

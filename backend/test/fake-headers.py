from fake_headers import Headers

if __name__ == "__main__":
    header = Headers(
        os="win",  # Generate ony Windows platform
        headers=False  # generate misc headers
    )

    with open("headers.txt", "a") as f:
        for i in range(20):
            f.write(f'{header.generate()}\n')
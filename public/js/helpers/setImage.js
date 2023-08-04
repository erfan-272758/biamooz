/* eslint-disable*/

export default (input, images, resetUrl) => {
  input?.addEventListener('change', () => {
    images.forEach((image) => (image.src = resetUrl));
    Object.keys(input.files).forEach((i) => {
      const file = input.files[i];
      const fr = new FileReader();
      fr.onload = (e) => {
        images[i].src = e.target.result;
      };
      fr.readAsDataURL(file);
    });
  });
};

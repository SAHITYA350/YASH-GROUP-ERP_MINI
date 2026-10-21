import { useForm } from "../../utils/formHook.js";
import { Actions, ErrorMessage, Field, Modal } from "../ui.jsx";

export default function CustomerForm({ close, save, error }) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  return (
    <Modal title="Register customer" close={close}>
      <form onSubmit={handleSubmit(save)} className="formgrid">
        <Field label="Business name">
          <input {...register("name", { required: true })} />
        </Field>
        <Field label="Email">
          <input type="email" {...register("email")} />
        </Field>
        <Field label="Phone">
          <input {...register("phone")} />
        </Field>
        <Field label="GSTIN">
          <input {...register("gstin")} />
        </Field>
        <Field label="City">
          <input {...register("city")} />
        </Field>
        <Field label="State">
          <input {...register("state")} />
        </Field>
        {error && <ErrorMessage error={error} />}
        <Actions close={close} loading={isSubmitting} save="Create customer" />
      </form>
    </Modal>
  );
}
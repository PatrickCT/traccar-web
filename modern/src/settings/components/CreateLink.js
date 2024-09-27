const CreateLink = () => {
  const { handleStep, previousStep, nextStep } = useWizard();
  handleStep(() => { });

  return (
    <>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          format="DD/MM/YYYY"
          value={dayjs(selectedItem.limitDate || '')}
          onChange={(newValue) => {
            setSelectedItem({ ...selectedItem, limitDate: moment.utc(newValue.toDate()) });
          }}
          className="customDatePickerWidth"
          label="Hasta cuando"
        />
      </LocalizationProvider>
      <div style={{ marginBottom: '20px' }} />
      <TextField
        fullWidth
        value={selectedItem.pass || ''}
        onChange={(event) => { setSelectedItem({ ...selectedItem, pass: event.target.value }); }}
        label={t('userPassword')}
      />
      <div style={{ marginBottom: '20px' }} />
      <Button
        disabled={selectedItem.limitDate == null}
        style={{ position: 'fixed', bottom: '0px', right: '0px' }}
        onClick={saveLink}
      >
        Guardar
      </Button>
      <Button onClick={() => previousStep()}>Previous ⏮️</Button>
      <Button onClick={() => nextStep()}>Next ⏭</Button>
    </>
  );
};
import { COLORS } from "@/styles/colors";

export default function App() {
  return (
    <Sheet sx={{}}>
      <Box
        sx={{
          width: "70%",
          // my: 1,
          mx: "auto",
          mt: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            my: 0.5,
          }}
        >
          <Input
            // autoFocus
            sx={{
              mx: "10px",
              width: "100%",
              height: 20,
              color: COLORS.grey_73,
            }}
            // value={question}
            // onChange={(event) => setQuestion(event.target.value)}
            // onKeyPress={handleEnter}
            placeholder="Write an employment contract for Ashok Jaiswal in Hong Kong as Tech Lead ..."
          />
        </Box>
      </Box>
    </Sheet>
  );
}
